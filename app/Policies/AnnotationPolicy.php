<?php

namespace App\Policies;

use App\Models\Annotation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AnnotationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        //
        return true;// static::commonPolicy($user, $annotation);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Annotation $annotation): bool
    {
        //
        return static::commonPolicy($user, $annotation);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Annotation $annotation): bool
    {
        //
        return static::commonPolicy($user, $annotation);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Annotation $annotation): bool
    {
        //
        return static::commonPolicy($user, $annotation);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Annotation $annotation): bool
    {
        //
        return static::commonPolicy($user, $annotation);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Annotation $annotation): bool
    {
        return static::commonPolicy($user, $annotation);
        //
    }

    private static function commonPolicy(User $user, Annotation $annotation)
    {
        return $user->is_admin || $user->id === $annotation->user_id;
    }
}
