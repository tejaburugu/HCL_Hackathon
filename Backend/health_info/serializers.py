from rest_framework import serializers
from .models import HealthArticle, PrivacyPolicy, FAQ


class HealthArticleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthArticle
        fields = ['id', 'title', 'slug', 'summary', 'category', 'image_url', 'is_featured', 'created_at']


class HealthArticleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthArticle
        fields = ['id', 'title', 'slug', 'summary', 'content', 'category', 'image_url', 'is_featured', 'created_at', 'updated_at']


class PrivacyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyPolicy
        fields = ['id', 'title', 'content', 'version', 'effective_date']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category']

