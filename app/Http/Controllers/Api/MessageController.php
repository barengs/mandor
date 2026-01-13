<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Get messages for a project
     */
    public function index(Request $request, Project $project)
    {
        $messages = $project->messages()
            ->with(['user:id,name,email', 'task:id,title', 'replyTo:id,content,user_id', 'replyTo.user:id,name'])
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
            'content' => 'nullable|string|max:5000',
            'task_id' => 'nullable|exists:tasks,id',
            'reply_to_id' => 'nullable|exists:messages,id',
            'attachment' => 'nullable|file|max:10240', // 10MB max
            'attachment_type' => 'nullable|in:image,file,voice',
        ]);

        // Either content or attachment is required
        if (empty($validated['content']) && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Content or attachment is required'], 422);
        }

        $attachmentPath = null;
        $attachmentType = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentType = $validated['attachment_type'] ?? 'file';
            
            // Determine folder based on type
            $folder = match($attachmentType) {
                'image' => 'chat/images',
                'voice' => 'chat/voices',
                default => 'chat/files',
            };
            
            $attachmentPath = $file->store($folder, 'public');
        }

        $message = $project->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'] ?? '',
            'task_id' => $validated['task_id'] ?? null,
            'reply_to_id' => $validated['reply_to_id'] ?? null,
            'attachment_path' => $attachmentPath,
            'attachment_type' => $attachmentType,
            'attachment_name' => $attachmentName,
        ]);

        $message->load(['user:id,name,email', 'task:id,title', 'replyTo:id,content,user_id', 'replyTo.user:id,name']);

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

        // Delete attachment if exists
        if ($message->attachment_path) {
            Storage::disk('public')->delete($message->attachment_path);
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
            ->with(['user:id,name,email', 'task:id,title', 'replyTo:id,content,user_id', 'replyTo.user:id,name'])
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
