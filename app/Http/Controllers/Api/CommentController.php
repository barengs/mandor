<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
        ]);

        $comments = Comment::where('task_id', $validated['task_id'])
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return CommentResource::collection($comments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'content' => 'required|string',
        ]);

        // TODO: Check if user has access to the task

        $comment = Comment::create([
            'task_id' => $validated['task_id'],
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return new CommentResource($comment->load('user'));
    }

    public function destroy(Comment $comment, Request $request)
    {
        if ($comment->user_id !== $request->user()->id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->noContent();
    }
}
