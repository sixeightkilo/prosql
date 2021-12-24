<?php
namespace Prosql\Traits;
use \Prosql\Models\{Device, User};

trait SigninTrait {
    public function signinRequired(array $device): bool {
        //the user can continue as guest for MAX_GUEST_DAYS. But if she has signed up 
        //before that she must be signed in to use the app

        $registeredAt = \DateTime::createFromFormat(Device::TIMESTAMP_FORMAT, $device['created_at']);
        $now = new \DateTime;
        $days = $now->diff($registeredAt)->format("%a");

        $userEmail = $this->sm->getUser()['email'] ?? '';

        $signinRequired = false;
        if ($days > User::MAX_GUEST_DAYS) {
            if (!$userEmail) {
                $signinRequired = true;
            }

            //logged in as guest, must sign in
            if ($userEmail == User::GUEST_EMAIL) {
                $signinRequired = true;
            }
        } else {
            //signed in and then got logged out
            //user_id will have a valid value only if the user has signed up
            if ($device['user_id'] && !$userEmail) {
                $signinRequired = true;
            }

            //todo: why do we reach here?
            if ($device['user_id'] && $userEmail == User::GUEST_EMAIL) {
                $signinRequired = true;
            }
        }

        $this->logger->debug(
            "user_id: {$device['user_id']} user: $userEmail days: $days signin-required " . intval($signinRequired));
        return $signinRequired;
    }
}
