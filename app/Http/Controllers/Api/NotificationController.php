<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Message;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get notifications: comments on user's tasks + chat messages mentioning user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get workspace IDs user has access to
        $ownedWorkspaceIds = $user->ownedWorkspaces()->pluck('id');
        $memberWorkspaceIds = $user->workspaces()->pluck('workspaces.id');
        $allWorkspaceIds = $ownedWorkspaceIds->merge($memberWorkspaceIds)->unique();
        
        // Get comments on tasks where user is creator or assignee
        $comments = Comment::whereHas('task', function($q) use ($user) {
                $q->where('creator_id', $user->id)
                  ->orWhereHas('assignees', function($q2) use ($user) {
                      $q2->where('users.id', $user->id);
                  });
            })
            ->where('user_id', '!=', $user->id)
            ->with(['user:id,name,email', 'task:id,title,project_id', 'task.project:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($comment) {
                return [
                    'id' => 'comment_' . $comment->id,
                    'type' => 'comment',
                    'content' => $comment->content,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                    ],
                    'context' => $comment->task->title,
                    'project_name' => $comment->task->project->name ?? null,
                    'created_at' => $comment->created_at,
                    'time_ago' => $comment->created_at->diffForHumans(),
                ];
            });

        // Get recent chat messages from user's projects (exclude own messages)
        $messages = Message::whereHas('project', function($q) use ($allWorkspaceIds) {
                $q->whereIn('workspace_id', $allWorkspaceIds);
            })
            ->where('user_id', '!=', $user->id)
            ->with(['user:id,name,email', 'project:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($message) {
                return [
                    'id' => 'message_' . $message->id,
                    'type' => 'chat',
                    'content' => $message->content,
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                    ],
                    'context' => $message->project->name ?? 'Project',
                    'project_id' => $message->project_id,
                    'created_at' => $message->created_at,
                    'time_ago' => $message->created_at->diffForHumans(),
                ];
            });

        // Merge and sort by date
        $notifications = $comments->concat($messages)
            ->sortByDesc('created_at')
            ->take(20)
            ->values();

        return response()->json([
            'data' => $notifications,
            'unread_count' => $notifications->count(),
            'comment_count' => $comments->count(),
            'chat_count' => $messages->count(),
        ]);
    }
}
