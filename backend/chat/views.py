from django.contrib.auth import get_user_model
from django.db.models import Count, DateTimeField, F, OuterRef, Q, Subquery
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message
from .serializers import MessageSerializer

User = get_user_model()


class UserListView(APIView):
    def get(self, request):
        last_message = Message.objects.filter(
            Q(sender=OuterRef('pk'), recipient=request.user) | Q(sender=request.user, recipient=OuterRef('pk'))
        ).order_by('-created_at').values('created_at')[:1]
        users = User.objects.exclude(id=request.user.id).annotate(
            last_message_at=Subquery(last_message, output_field=DateTimeField()),
            unread_count=Count(
                'sent_messages',
                filter=Q(sent_messages__recipient=request.user, sent_messages__is_read=False),
            ),
        ).order_by(F('last_message_at').desc(nulls_last=True), 'username')
        return Response([{
            'id': user.id,
            'username': user.username,
            'is_online': user.is_online,
            'unread_count': user.unread_count,
        } for user in users])


class ConversationView(APIView):
    def get(self, request, other_user_id):
        other_user = get_object_or_404(User, id=other_user_id)
        messages = Message.objects.filter(Q(sender=request.user, recipient=other_user) | Q(sender=other_user, recipient=request.user))
        return Response(MessageSerializer(messages, many=True).data)


class MarkReadView(APIView):
    def patch(self, request, other_user_id):
        get_object_or_404(User, id=other_user_id)
        updated = Message.objects.filter(recipient=request.user, sender_id=other_user_id, is_read=False).update(is_read=True)
        return Response({'marked_read': updated})
