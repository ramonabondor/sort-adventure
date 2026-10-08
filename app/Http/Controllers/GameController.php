<?php
namespace App\Http\Controllers;
use App\Services\SortingGame;
use Illuminate\Http\Request;
use InvalidArgumentException;

class GameController
{
    public function __construct(private SortingGame $engine) {}

    private function levels(): array { return config('game.levels'); }
    private function level(int $id): array
    {
        foreach ($this->levels() as $level) { if ($level['id'] === $id) { return $level; } }
        abort(404, 'Nivel inexistent.');
    }
    // Newly appended levels become available to players who finished the old final level.
    private function progress(Request $request): array
    {
        $progress = $request->session()->get('progress', ['unlocked' => 1, 'completed' => []]);
        foreach ($this->levels() as $level) {
            if (isset($progress['completed'][$level['id']])) {
                $progress['unlocked'] = max($progress['unlocked'], min(count($this->levels()), $level['id'] + 1));
            }
        }
        $request->session()->put('progress', $progress);
        return $progress;
    }

    private function payload(Request $request): array
    {
        return ['levels' => $this->levels(), 'game' => $request->session()->get('game'),
            'progress' => $this->progress($request)];
    }
    public function index(Request $request)
    {
        if (!$request->session()->has('game')) { $request->session()->put('game', $this->engine->start($this->level(1))); }
        return view('game', ['initial' => $this->payload($request)]);
    }
    public function state(Request $request) { return response()->json($this->payload($request)); }
    public function start(Request $request)
    {
        $data = $request->validate(['level_id' => 'required|integer|min:1']);
        $level = $this->level((int) $data['level_id']);
        abort_if($level['id'] > $this->progress($request)['unlocked'], 403, 'Termină nivelul anterior pentru a continua.');
        $request->session()->put('game', $this->engine->start($level));
        return response()->json($this->payload($request));
    }
    public function move(Request $request)
    {
        $data = $request->validate(['value' => 'required|integer', 'run_id' => 'required|string', 'revision' => 'required|integer|min:0']);
        $state = $request->session()->get('game');
        abort_if(!$state, 409, 'Pornește un nivel.');
        abort_if($state['run_id'] !== $data['run_id'] || $state['revision'] !== (int) $data['revision'], 409, 'Jocul s-a schimbat. Sincronizează pagina.');
        $level = $this->level($state['level_id']);
        try { $state = $this->engine->move($state, $level, (int) $data['value']); }
        catch (InvalidArgumentException $e) { return response()->json(['message' => $e->getMessage()], 422); }
        $request->session()->put('game', $state);
        if ($state['completed']) {
            $progress = $request->session()->get('progress', ['unlocked' => 1, 'completed' => []]);
            $old = $progress['completed'][$level['id']] ?? null;
            $progress['completed'][$level['id']] = ['best_moves' => $old ? min($old['best_moves'], $state['moves']) : $state['moves']];
            $progress['unlocked'] = max($progress['unlocked'], min(count($this->levels()), $level['id'] + 1));
            $request->session()->put('progress', $progress);
        }
        return response()->json($this->payload($request));
    }
}
