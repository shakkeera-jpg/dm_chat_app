from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(read_only=True)
    recipient_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender_id', 'recipient_id', 'text_content', 'is_read', 'created_at')
