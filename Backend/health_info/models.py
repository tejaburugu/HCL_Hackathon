from django.db import models


class HealthArticle(models.Model):
    CATEGORY_CHOICES = [
        ('covid', 'COVID-19'),
        ('flu', 'Seasonal Flu'),
        ('mental_health', 'Mental Health'),
        ('nutrition', 'Nutrition'),
        ('fitness', 'Fitness'),
        ('preventive', 'Preventive Care'),
        ('general', 'General Health'),
    ]
    
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)
    summary = models.TextField()
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    image_url = models.URLField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class PrivacyPolicy(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    version = models.CharField(max_length=20)
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-effective_date']
        verbose_name_plural = 'Privacy Policies'
    
    def __str__(self):
        return f"{self.title} v{self.version}"


class FAQ(models.Model):
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=50, default='general')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
    
    def __str__(self):
        return self.question
