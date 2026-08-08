from django.urls import path
from .views import ConversationView, MarkReadView, UserListView

urlpatterns = [
    path('users', UserListView.as_view()),
    path('messages/<int:other_user_id>', ConversationView.as_view()),
    path('messages/<int:other_user_id>/read', MarkReadView.as_view()),
]
