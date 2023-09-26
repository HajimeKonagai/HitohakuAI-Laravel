<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('address_dictionaries', function (Blueprint $table) {
            $table->id();
            $table->string('zip')->default('');
            $table->string('ja_pref')->default('');
            $table->string('ja_city')->default('');
            $table->string('ja_addr')->default('');
            $table->string('en_pref')->default('');
            $table->string('en_city')->default('');
            $table->string('en_addr')->default('');
            $table->string('ja_pref_no_pref')->default('');
            $table->string('en_pref_no_pref')->default('');
            $table->string('ja_city_spaced')->default('');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('address_dictionaries');
    }
};
