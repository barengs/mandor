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
        // Add has_sprints flag to projects
        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('has_sprints')->default(false)->after('key');
        });

        // Add sprint_id to tasks (nullable = backlog)
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('sprint_id')->nullable()->after('status_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['sprint_id']);
            $table->dropColumn('sprint_id');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('has_sprints');
        });
    }
};
