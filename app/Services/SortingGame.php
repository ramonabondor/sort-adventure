<?php
namespace App\Services;
use InvalidArgumentException;

class SortingGame
{
    public function target(array $level): array
    {
        $target = $level['numbers'];
        sort($target, SORT_NUMERIC);
        return $level['direction'] === 'desc' ? array_reverse($target) : $target;
    }

    public function start(array $level, ?array $values = null): array
    {
        $target = $this->target($level);
        if ($values === null) {
            $values = $target;
            shuffle($values);
            if ($values === $target) { [$values[0], $values[1]] = [$values[1], $values[0]]; }
        }
        $check = $values;
        sort($check, SORT_NUMERIC);
        $expected = $target;
        sort($expected, SORT_NUMERIC);
        if ($check !== $expected) { throw new InvalidArgumentException('Numere invalide.'); }
        return ['level_id' => $level['id'], 'values' => $values, 'target' => $target,
            'moves' => 0, 'comparisons' => 0, 'cursor' => 0, 'end' => count($values) - 1,
            'pass_swapped' => false, 'passes' => 1, 'completed' => $values === $target,
            'message' => 'Apasă un obiect pentru a începe.', 'run_id' => bin2hex(random_bytes(12)), 'revision' => 0];
    }

    public function move(array $state, array $level, int $value): array
    {
        if ($state['completed']) { return $state; }
        $index = array_search($value, $state['values'], true);
        if ($index === false) { throw new InvalidArgumentException('Obiect inexistent.'); }
        if ($level['mode'] === 'direct') {
            $destination = array_search($value, $state['target'], true);
            if ($index === $destination) { $state['message'] = "$value este deja la locul potrivit."; }
            else {
                [$state['values'][$index], $state['values'][$destination]] = [$state['values'][$destination], $state['values'][$index]];
                $state['moves']++;
                $state['message'] = "$value s-a mutat la poziția ".($destination + 1).'.';
            }
        } else {
            $i = $state['cursor'];
            if ($index !== $i && $index !== $i + 1) { throw new InvalidArgumentException('Apasă unul dintre cei doi vecini evidențiați.'); }
            $a = $state['values'][$i]; $b = $state['values'][$i + 1];
            $swap = $level['direction'] === 'asc' ? $a > $b : $a < $b;
            $state['comparisons']++;
            if ($swap) {
                [$state['values'][$i], $state['values'][$i + 1]] = [$b, $a];
                $state['moves']++; $state['pass_swapped'] = true;
            }
            $state['message'] = $swap ? "$a și $b au schimbat locurile." : "$a și $b sunt în ordinea corectă. Continuăm!";
            $state['cursor']++;
            if ($state['cursor'] >= $state['end']) {
                $state['end']--;
                $state['completed'] = !$state['pass_swapped'] || $state['end'] < 1;
                $state['cursor'] = 0; $state['pass_swapped'] = false; $state['passes']++;
            }
        }
        $state['completed'] = $state['completed'] || $state['values'] === $state['target'];
        $state['revision']++;
        if ($state['completed']) { $state['message'] = 'Bravo! Toate numerele sunt la locul lor.'; }
        return $state;
    }
}
