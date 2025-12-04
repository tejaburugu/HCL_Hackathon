from django.urls import path
from .views import (
    HealthArticleListView, HealthArticleDetailView, FeaturedArticlesView,
    LatestArticlesView, PrivacyPolicyView, FAQListView, PublicHealthInfoView
)

urlpatterns = [
    # Health Articles
    path('articles/', HealthArticleListView.as_view(), name='articles_list'),
    path('articles/featured/', FeaturedArticlesView.as_view(), name='featured_articles'),
    path('articles/latest/', LatestArticlesView.as_view(), name='latest_articles'),
    path('articles/<slug:slug>/', HealthArticleDetailView.as_view(), name='article_detail'),
    
    # Privacy & FAQ
    path('privacy-policy/', PrivacyPolicyView.as_view(), name='privacy_policy'),
    path('faqs/', FAQListView.as_view(), name='faq_list'),
    
    # Combined
    path('public/', PublicHealthInfoView.as_view(), name='public_health_info'),
]

