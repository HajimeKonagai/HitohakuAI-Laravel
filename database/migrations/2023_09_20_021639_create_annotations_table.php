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
        Schema::create('annotations', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id');
            $table->integer('entity_edited_as_2')->default(0);
            $table->integer('priority');
            $table->text('text')->nullable()->default(null);
            $table->json('entities');
            $table->string('code'); // 識別用コード
            $table->json('data');
            $table->text('memo')->nullable()->default(null);
            $table->boolean('is_endangered')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annotations');
    }
};
