<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add budget fields to projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->decimal('total_budget', 15, 2)->default(0)->after('key');
            $table->string('currency', 3)->default('IDR')->after('total_budget');
        });

        // Create project member budgets table
        Schema::create('project_member_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role')->nullable(); // e.g., Developer, Designer, PM
            $table->decimal('rate', 15, 2)->default(0); // Rate per unit
            $table->enum('rate_type', ['hourly', 'daily', 'monthly', 'fixed'])->default('monthly');
            $table->decimal('hours_allocated', 10, 2)->nullable(); // For hourly rates
            $table->decimal('total_amount', 15, 2)->default(0); // Total budget for this member
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['project_id', 'user_id']);
        });

        // Create budget expenses table for tracking actual expenses
        Schema::create('project_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Who logged it
            $table->string('category'); // e.g., Labor, Software, Hardware, Other
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');
            $table->string('receipt_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_expenses');
        Schema::dropIfExists('project_member_budgets');
        
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['total_budget', 'currency']);
        });
    }
};
