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
        Schema::create('data', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id');

            $table->string('code')->default(''); // 識別用コード
            $table->text('text')->nullable()->default(null); // O
            $table->json('entities')->nullable()->default(null); 
            $table->string('file_path')->default('');

            $table->string('en_family')->default('');
            $table->string('ja_family')->default('');
            $table->string('en_name'  )->default('');
            $table->string('ja_name'  )->default('');
            $table->string('ja_pref'  )->default('');
            $table->string('ja_city'  )->default('');
            $table->string('ja_addr'  )->default('');
            $table->string('en_pref'  )->default('');
            $table->string('en_city'  )->default('');
            $table->string('en_addr'  )->default('');
            $table->string('date'     )->default('');
            $table->string('person'   )->default('');
            $table->string('number'   )->default('');
            $table->string('country'  )->default('');
            $table->string('lat'      )->default('');
            $table->string('lng'      )->default('');
            $table->string('alt'      )->default('');
            $table->text('memo'     )->nullable()->default(null);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data');
    }
};
