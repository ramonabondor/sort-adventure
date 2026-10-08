<?php
namespace Tests\Unit;
use App\Services\SortingGame;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
class SortingGameTest extends TestCase
{
    private function permutations(array $a): array
    {
        if (count($a) < 2) { return [$a]; }
        $out = [];
        foreach ($a as $i => $v) {
            $rest = $a; array_splice($rest, $i, 1);
            foreach ($this->permutations($rest) as $tail) { $out[] = array_merge([$v], $tail); }
        }
        return $out;
    }
    public function test_all_permutations_sort_in_both_modes_and_directions(): void
    {
        $engine = new SortingGame;
        foreach (['direct', 'bubble'] as $mode) {
            foreach (['asc', 'desc'] as $direction) {
                $level = ['id' => 1, 'mode' => $mode, 'direction' => $direction, 'numbers' => [2, 4, 8, 16, 32]];
                foreach ($this->permutations($level['numbers']) as $values) {
                    $state = $engine->start($level, $values); $steps = 0;
                    while (!$state['completed']) {
                        if ($mode === 'bubble') { $v = $state['values'][$state['cursor']]; }
                        else { foreach ($state['values'] as $i => $v) { if ($v !== $state['target'][$i]) { break; } } }
                        $before = $state['values'];
                        $state = $engine->move($state, $level, $v);
                        $changed = [];
                        foreach ($before as $i => $n) { if ($n !== $state['values'][$i]) { $changed[] = $i; } }
                        if ($mode === 'bubble' && $changed) { $this->assertSame(1, $changed[1] - $changed[0]); }
                        $this->assertLessThanOrEqual(20, ++$steps);
                    }
                    $this->assertSame($engine->target($level), $state['values']);
                }
            }
        }
    }
    public function test_cannot_compare_an_inactive_pair(): void
    {
        $engine = new SortingGame;
        $level = ['id' => 1, 'mode' => 'bubble', 'direction' => 'asc', 'numbers' => [1, 2, 3]];
        $state = $engine->start($level, [3, 2, 1]);
        $this->expectException(InvalidArgumentException::class);
        $engine->move($state, $level, 1);
    }
    public function test_already_placed_number_does_not_increase_moves(): void
    {
        $engine = new SortingGame;
        $level = ['id' => 1, 'mode' => 'direct', 'direction' => 'asc', 'numbers' => [1, 2, 3]];
        $state = $engine->move($engine->start($level, [1, 3, 2]), $level, 1);
        $this->assertSame(0, $state['moves']);
        $this->assertFalse($state['completed']);
    }
}
