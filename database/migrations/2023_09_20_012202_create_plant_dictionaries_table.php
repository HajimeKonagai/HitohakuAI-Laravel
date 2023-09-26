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
        Schema::create('plant_dictionaries', function (Blueprint $table) {
            $table->id();
            $table->integer('s_name_code')->default(0);
            $table->string('ja_name')->default('');
            $table->string('en_name')->default('');
            $table->string('f_code')->default('');
            $table->string('ja_family')->default('');
            $table->string('en_family')->default('');
            $table->text('search')->nullable()->default(null);
            $table->string('kbn')->default('');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plant_dictionaries');
    }
};
