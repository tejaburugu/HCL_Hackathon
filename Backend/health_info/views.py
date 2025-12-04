from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HealthArticle, PrivacyPolicy, FAQ
from .serializers import (
    HealthArticleListSerializer, HealthArticleDetailSerializer,
    PrivacyPolicySerializer, FAQSerializer
)


class HealthArticleListView(generics.ListAPIView):
    """Public endpoint - list all published health articles"""
    permission_classes = [permissions.AllowAny]
    serializer_class = HealthArticleListSerializer
    
    def get_queryset(self):
        queryset = HealthArticle.objects.filter(is_published=True)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        return queryset


class HealthArticleDetailView(generics.RetrieveAPIView):
    """Public endpoint - get single health article by slug"""
    permission_classes = [permissions.AllowAny]
    serializer_class = HealthArticleDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return HealthArticle.objects.filter(is_published=True)


class FeaturedArticlesView(APIView):
    """Get featured health articles for homepage"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        articles = HealthArticle.objects.filter(is_published=True, is_featured=True)[:6]
        serializer = HealthArticleListSerializer(articles, many=True)
        return Response(serializer.data)


class LatestArticlesView(APIView):
    """Get latest health articles"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Get one article from each main category
        categories = ['covid', 'flu', 'mental_health']
        articles = []
        
        for cat in categories:
            article = HealthArticle.objects.filter(
                is_published=True, 
                category=cat
            ).first()
            if article:
                articles.append(article)
        
        # If not enough articles, get latest ones
        if len(articles) < 3:
            extra = HealthArticle.objects.filter(is_published=True).exclude(
                id__in=[a.id for a in articles]
            )[:3 - len(articles)]
            articles.extend(extra)
        
        serializer = HealthArticleListSerializer(articles, many=True)
        return Response(serializer.data)


class PrivacyPolicyView(APIView):
    """Get current active privacy policy"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        policy = PrivacyPolicy.objects.filter(is_active=True).first()
        if policy:
            serializer = PrivacyPolicySerializer(policy)
            return Response(serializer.data)
        return Response({
            'title': 'Privacy Policy',
            'content': 'Privacy policy content is being updated.',
            'version': '1.0',
            'effective_date': '2024-01-01'
        })


class FAQListView(generics.ListAPIView):
    """Public endpoint - list FAQs"""
    permission_classes = [permissions.AllowAny]
    serializer_class = FAQSerializer
    
    def get_queryset(self):
        queryset = FAQ.objects.filter(is_active=True)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset


class PublicHealthInfoView(APIView):
    """Combined public health information for homepage"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Get latest articles
        latest_articles = HealthArticle.objects.filter(is_published=True)[:6]
        
        # Get FAQ
        faqs = FAQ.objects.filter(is_active=True)[:5]
        
        return Response({
            'articles': HealthArticleListSerializer(latest_articles, many=True).data,
            'faqs': FAQSerializer(faqs, many=True).data,
        })
