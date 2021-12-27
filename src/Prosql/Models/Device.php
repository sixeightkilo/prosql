<?php
namespace Prosql\Models;

class Device extends BaseModel {
    protected static string $table = "devices";

    //upsert
    function save(array $values): int {
        $id = parent::get(['id'], [
            ['device_id', '=', $values['device_id']]
        ])[0]['id'] ?? null;

        if ($id) {
            parent::update([
                'version' => $values['version'],
                'os' => $values['os'],
            ],[
               ['id', '=', $id] 
            ]);

            return $id;
        }

        return parent::save($values);
    }

    function setUserId(string $deviceId, int $userId): void {
        parent::update([
            'user_id' => $userId
        ], [
            ['device_id', '=', $deviceId]
        ]);
    }
}
