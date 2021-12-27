<?php
namespace Prosql\Utils;

class Validator {
    const NOT_EMPTY = 0;
    const IS_EMAIL = 1;
    const IS_NUMERIC = 2;
    const MIN_LENGTH = 3;
    const IN_ARRAY = 4;
    const IS_ARRAY = 5;
    const IS_DATE = 6;
    const MAX_LENGTH = 7;
    const IS_POSITIVE = 8;
    const IS_GTE_ZERO = 9;
    const PHONE_LENGTH = 10;

    public static function validate($fields) {
        foreach ($fields as $f) {
            //we need field, alias and rules for each value to be checked
            if (!array_key_exists('field', $f)) {
                throw new \Exception('No field specified');
            }

            if (!array_key_exists('alias', $f)) {
                throw new \Exception('No alias specified');
            }

            if (!array_key_exists('rules', $f)) {
                throw new \Exception('No rules specified');
            }

            foreach ($f['rules'] as $r) {
                static::check($f, $r);
            }
        }
    }

    private static function check($f, $rule) {
        switch ($rule) {
        case static::IS_EMAIL:
            if (!filter_var($f['field'], FILTER_VALIDATE_EMAIL)) {
                throw new \Exception("Please provide a valid {$f['alias']}");
            }

            break;

        case static::NOT_EMPTY:
            if (!$f['field']) { 
                throw new \Exception("{$f['alias']} cannot be empty!");
            }

            break;

        case static::IS_NUMERIC:
            if (!is_numeric($f['field'])) { 
                throw new \Exception("{$f['alias']} must be a number!");
            }

            break;

        case static::IN_ARRAY:
            if (!isset($f['array'])) {
                throw new \Exception("No array specified");
            }

            if (!in_array($f['field'], $f['array'])) {
                throw new \Exception("Please specify valid value for {$f['alias']}!");
            }

            break;

        case static::MIN_LENGTH:
            if (!isset($f['min-length'])) {
                throw new \Exception("No minimum length provided!");
            }

            if (!is_numeric($f['min-length'])) {
                throw new \Exception("Please provide valid minimum length!");
            }

            if (strlen($f['field']) < $f['min-length']) {
                throw new \Exception("{$f['alias']} must be at least {$f['min-length']} characters!");
            }

            break;

        case static::MAX_LENGTH:
            if (!isset($f['max-length'])) {
                throw new \Exception("No maximum length provided!");
            }

            if (!is_numeric($f['max-length'])) {
                throw new \Exception("Please provide valid minimum length!");
            }

            if (strlen($f['field']) > $f['max-length']) {
                throw new \Exception("{$f['alias']} must not be greater than {$f['max-length']} characters!");
            }

            break;

        case static::IS_ARRAY:
            if (!is_array($f['field'])) {
                throw new Exception("Please provide valid {$f['alias']}");
            }

            break;

        case static::IS_DATE:
            if (!isset($f['format'])) {
                throw new \Exception("Date format not provided!");
            }

            $date = \DateTime::createFromFormat($f['format'], $f['field']);

            if (!$date) {
                throw new \Exception("Please provide valid {$f['alias']}");
            }

            break;

        case static::IS_POSITIVE:
            if (!is_numeric($f['field'])) { 
                throw new \Exception("{$f['alias']} must be a number!");
            }

            if ($f['field'] <= 0) {
                throw new \Exception("{$f['alias']} must be positive!");
            }

            break;

        case static::IS_GTE_ZERO:
            if (!is_numeric($f['field'])) { 
                throw new \Exception("{$f['alias']} must be a number!");
            }

            if ($f['field'] < 0) {
                throw new \Exception("{$f['alias']} must be greater or equal to zero!");
            }

            break;

        case static::PHONE_LENGTH:
            if (strlen($f['field']) != 10) { 
                throw new \Exception("{$f['alias']} must contain 10 digits!");
            }

            break;	
        }
    }
}
