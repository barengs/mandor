<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Project;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get messages for a project
     */
    public function index(Request $request, Project $project)
    {
        $messages = $project->messages()
            ->with(['user:id,name,email', 'replyTo:id,content,user_id', 'replyTo.user:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    /**
     * Send a new message
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'reply_to_id' => 'nullable|exists:messages,id',
        ]);

        $message = $project->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        $message->load(['user:id,name,email', 'replyTo:id,content,user_id', 'replyTo.user:id,name']);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message,
        ], 201);
    }

    /**
     * Delete a message (only by owner)
     */
    public function destroy(Request $request, Project $project, Message $message)
    {
        // Check if message belongs to project
        if ($message->project_id !== $project->id) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        // Check if user owns the message
        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }

    /**
     * Get new messages since a timestamp (for polling)
     */
    public function poll(Request $request, Project $project)
    {
        $since = $request->query('since');
        
        $query = $project->messages()
            ->with(['user:id,name,email', 'replyTo:id,content,user_id', 'replyTo.user:id,name'])
            ->orderBy('created_at', 'asc');

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->limit(100)->get();

        return response()->json([
            'data' => $messages,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
