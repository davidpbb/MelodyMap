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
        Schema::create('artists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('bio')->nullable();
            $table->string('image')->nullable();
            $table->string('pais');
            $table->string('genero');
            $table->string('genero_musical');
            $table->date('fecha_de_nacimiento');
            $table->string('discográfica')->nullable();
            $table->string('youtube');
            $table->string('spotify')->nullable();
            $table->string('instagram')->nullable();
            $table->string('other_links')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artists');
    }
};
