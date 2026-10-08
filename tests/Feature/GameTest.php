<?php
namespace Tests\Feature;
use App\Services\SortingGame;
use Tests\TestCase;
class GameTest extends TestCase
{
    public function test_home_and_initial_state(): void
    {
        $this->get('/')->assertOk()->assertSee('Sort Adventure')->assertSee('csrf-token');
        $this->getJson('/game/state')->assertOk()->assertJsonPath('game.level_id', 1)->assertJsonPath('progress.unlocked', 1);
    }
    public function test_locked_level_is_rejected(): void
    {
        $this->postJson('/game/start', ['level_id' => 4])->assertForbidden();
    }
    public function test_invalid_move_is_rejected(): void
    {
        $state = (new SortingGame)->start(config('game.levels')[0], [2, 1, 3, 4, 5]);
        $this->withSession(['game' => $state])->postJson('/game/move', ['value' => 999, 'run_id' => $state['run_id'], 'revision' => 0])->assertUnprocessable();
    }
    public function test_stale_request_is_rejected(): void
    {
        $state = (new SortingGame)->start(config('game.levels')[0], [2, 1, 3, 4, 5]);
        $this->withSession(['game' => $state])->postJson('/game/move', ['value' => 2, 'run_id' => $state['run_id'], 'revision' => 1])->assertConflict();
    }
    public function test_completing_level_unlocks_next_and_persists_result(): void
    {
        $state = (new SortingGame)->start(config('game.levels')[0], [2, 1, 3, 4, 5]);
        $this->withSession(['game' => $state])->postJson('/game/move', ['value' => 2, 'run_id' => $state['run_id'], 'revision' => 0])
            ->assertOk()->assertJsonPath('game.completed', true)->assertJsonPath('progress.unlocked', 2)->assertJsonPath('progress.completed.1.best_moves', 1);
        $this->postJson('/game/start', ['level_id' => 2])->assertOk()->assertJsonPath('game.level_id', 2);
    }

    public function test_old_completed_final_level_unlocks_seven_without_replaying(): void
    {
        $this->withSession(['progress' => ['unlocked' => 6, 'completed' => [6 => ['best_moves' => 8]]]])
            ->postJson('/game/start', ['level_id' => 7])
            ->assertOk()->assertJsonPath('game.level_id', 7)->assertJsonPath('progress.unlocked', 7)
            ->assertJsonPath('progress.completed.6.best_moves', 8);
        $this->postJson('/game/start', ['level_id' => 8])->assertForbidden();
    }

    public function test_upgrade_preserves_an_unfinished_game_and_keeps_seven_locked(): void
    {
        $state = (new SortingGame)->start(config('game.levels')[5], [5, 10, 15, 20, 25, 30, 35, 40]);
        $this->withSession(['game' => $state, 'progress' => ['unlocked' => 6, 'completed' => [5 => ['best_moves' => 6]]]])
            ->getJson('/game/state')->assertOk()->assertJsonPath('game.run_id', $state['run_id'])
            ->assertJsonPath('game.values', $state['values'])->assertJsonPath('progress.unlocked', 6);
        $this->postJson('/game/start', ['level_id' => 7])->assertForbidden();
    }
}
