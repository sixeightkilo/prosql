<?php
namespace Prosql\Models;

class User extends BaseModel {
    const MAX_GUEST_DAYS = 15;
    const GUEST_FIRST_NAME = 'Guest';
    const GUEST_LAST_NAME = '';
    const GUEST_EMAIL = 'guest@prosql.io';
    protected static string $table = "users";
}
