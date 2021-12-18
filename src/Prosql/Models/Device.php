<?php
namespace Prosql\Models;

class Device extends BaseModel {
    protected static string $table = "devices";

    function save(array $values): int {
        $id = parent::get(['id'], [
            ['device_id', '=', $values['device_id']]
        ])[0]['id'] ?? null;

        if ($id) {
            return $id;
        }

        return parent::save($values);
    }
}
