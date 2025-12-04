"""
Management command to seed the database with initial data
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, PatientProfile, ProviderProfile
from wellness.models import HealthTip
from health_info.models import HealthArticle, PrivacyPolicy, FAQ


class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create Healthcare Providers (Doctors)
        providers = [
            {
                'email': 'dr.sarah.johnson@healthcare.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'role': 'provider',
                'phone': '+1-555-0101',
                'profile': {
                    'specialization': 'Primary Care Physician',
                    'license_number': 'MD-12345',
                    'years_of_experience': 15,
                    'hospital_affiliation': 'City General Hospital',
                }
            },
            {
                'email': 'dr.michael.chen@healthcare.com',
                'first_name': 'Michael',
                'last_name': 'Chen',
                'role': 'provider',
                'phone': '+1-555-0102',
                'profile': {
                    'specialization': 'Cardiologist',
                    'license_number': 'MD-23456',
                    'years_of_experience': 12,
                    'hospital_affiliation': 'Heart & Vascular Center',
                }
            },
            {
                'email': 'dr.emily.williams@healthcare.com',
                'first_name': 'Emily',
                'last_name': 'Williams',
                'role': 'provider',
                'phone': '+1-555-0103',
                'profile': {
                    'specialization': 'Nutritionist',
                    'license_number': 'RD-34567',
                    'years_of_experience': 10,
                    'hospital_affiliation': 'Wellness Medical Group',
                }
            },
            {
                'email': 'dr.james.brown@healthcare.com',
                'first_name': 'James',
                'last_name': 'Brown',
                'role': 'provider',
                'phone': '+1-555-0104',
                'profile': {
                    'specialization': 'General Practitioner',
                    'license_number': 'MD-45678',
                    'years_of_experience': 20,
                    'hospital_affiliation': 'Community Health Clinic',
                }
            },
        ]
        
        for provider_data in providers:
            profile_data = provider_data.pop('profile')
            user, created = User.objects.get_or_create(
                email=provider_data['email'],
                defaults={
                    **provider_data,
                    'data_consent': True,
                }
            )
            if created:
                user.set_password('Provider123!')  # Default password for demo
                user.save()
                ProviderProfile.objects.get_or_create(
                    user=user,
                    defaults=profile_data
                )
        self.stdout.write(self.style.SUCCESS(f'Created {len(providers)} healthcare providers'))
        
        # Create Health Tips
        tips = [
            {
                'title': 'Stay Hydrated',
                'content': 'Aim to drink at least 8 glasses of water per day to keep your body hydrated and functioning optimally. Water helps regulate body temperature, transport nutrients, and flush out toxins.',
                'category': 'hydration',
                'is_active': True,
            },
            {
                'title': 'Get Moving',
                'content': 'Try to get at least 30 minutes of moderate exercise daily. Even a brisk walk counts! Regular physical activity can help prevent heart disease, diabetes, and obesity.',
                'category': 'exercise',
                'is_active': True,
            },
            {
                'title': 'Sleep Well',
                'content': 'Adults need 7-9 hours of sleep per night. Maintain a consistent sleep schedule for better rest. Quality sleep is essential for immune function and mental health.',
                'category': 'sleep',
                'is_active': True,
            },
            {
                'title': 'Eat Your Vegetables',
                'content': 'Include a variety of colorful vegetables in your diet. They provide essential vitamins, minerals, and fiber that support overall health and disease prevention.',
                'category': 'nutrition',
                'is_active': True,
            },
            {
                'title': 'Take Mental Breaks',
                'content': 'Practice mindfulness or take short breaks throughout the day to reduce stress and improve focus. Even 5 minutes of deep breathing can make a difference.',
                'category': 'mental_health',
                'is_active': True,
            },
            {
                'title': 'Limit Screen Time',
                'content': 'Take regular breaks from screens to reduce eye strain and improve sleep quality. Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
                'category': 'general',
                'is_active': True,
            },
            {
                'title': 'Practice Gratitude',
                'content': 'Take a moment each day to reflect on things you are grateful for. This simple practice has been shown to improve mental well-being and reduce stress.',
                'category': 'mental_health',
                'is_active': True,
            },
        ]
        
        for tip_data in tips:
            HealthTip.objects.get_or_create(
                title=tip_data['title'],
                defaults=tip_data
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(tips)} health tips'))
        
        # Create Health Articles
        articles = [
            {
                'title': 'Understanding Your Heart Health',
                'slug': 'understanding-heart-health',
                'summary': 'Learn about the key factors that affect your cardiovascular health and what you can do to keep your heart strong.',
                'content': '''<h2>Your Heart Matters</h2>
<p>Heart disease remains the leading cause of death worldwide, but the good news is that most cardiovascular diseases are preventable through lifestyle changes.</p>

<h3>Key Risk Factors</h3>
<ul>
    <li><strong>High Blood Pressure:</strong> Often called the "silent killer," high blood pressure damages blood vessels over time.</li>
    <li><strong>High Cholesterol:</strong> Excess cholesterol can build up in your arteries, reducing blood flow.</li>
    <li><strong>Smoking:</strong> Damages blood vessels and significantly increases heart disease risk.</li>
    <li><strong>Obesity:</strong> Puts extra strain on your heart and is linked to other risk factors.</li>
</ul>

<h3>Prevention Tips</h3>
<ul>
    <li>Exercise regularly - aim for 150 minutes of moderate activity per week</li>
    <li>Eat a heart-healthy diet rich in fruits, vegetables, and whole grains</li>
    <li>Maintain a healthy weight</li>
    <li>Don't smoke and limit alcohol consumption</li>
    <li>Manage stress through relaxation techniques</li>
    <li>Get regular check-ups and know your numbers</li>
</ul>''',
                'category': 'heart_health',
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'The Importance of Preventive Care',
                'slug': 'importance-of-preventive-care',
                'summary': 'Discover why regular check-ups and screenings are crucial for catching health issues early.',
                'content': '''<h2>Prevention is Better Than Cure</h2>
<p>Preventive care focuses on disease prevention and early detection rather than treatment after illness occurs.</p>

<h3>Essential Screenings by Age</h3>
<h4>Adults 18-39:</h4>
<ul>
    <li>Blood pressure screening every 2 years</li>
    <li>Cholesterol check every 4-6 years</li>
    <li>Dental check-up every 6 months</li>
    <li>Eye exam every 2 years</li>
</ul>

<h4>Adults 40-64:</h4>
<ul>
    <li>Annual physical exam</li>
    <li>Diabetes screening every 3 years</li>
    <li>Colorectal cancer screening starting at 45</li>
    <li>Mammogram (women) every 1-2 years</li>
</ul>

<h4>Adults 65+:</h4>
<ul>
    <li>Annual wellness visits</li>
    <li>Bone density scan</li>
    <li>Hearing and vision tests annually</li>
    <li>Cognitive assessments</li>
</ul>''',
                'category': 'preventive_care',
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Mental Health: Breaking the Stigma',
                'slug': 'mental-health-breaking-stigma',
                'summary': 'Explore resources and support options for maintaining good mental health in today\'s challenging world.',
                'content': '''<h2>Taking Care of Your Mental Health</h2>
<p>Mental health is just as important as physical health, yet it often receives less attention. One in five adults experiences mental illness each year.</p>

<h3>Signs You May Need Support</h3>
<ul>
    <li>Persistent feelings of sadness or hopelessness</li>
    <li>Excessive worry or fear</li>
    <li>Changes in sleep or appetite</li>
    <li>Difficulty concentrating</li>
    <li>Withdrawal from friends and activities</li>
</ul>

<h3>Self-Care Strategies</h3>
<ul>
    <li><strong>Exercise:</strong> Physical activity releases endorphins that improve mood</li>
    <li><strong>Sleep:</strong> Maintain a regular sleep schedule of 7-9 hours</li>
    <li><strong>Connection:</strong> Stay connected with friends and family</li>
    <li><strong>Mindfulness:</strong> Practice meditation or deep breathing exercises</li>
    <li><strong>Limit Alcohol:</strong> Alcohol can worsen anxiety and depression</li>
</ul>

<h3>When to Seek Help</h3>
<p>If symptoms persist for more than two weeks or interfere with daily life, please reach out to a mental health professional.</p>''',
                'category': 'mental_health',
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Nutrition 101: Building a Healthy Diet',
                'slug': 'nutrition-101-healthy-diet',
                'summary': 'Learn the fundamentals of nutrition and how to build a balanced diet for optimal health.',
                'content': '''<h2>The Building Blocks of Nutrition</h2>
<p>Good nutrition is the foundation of health. What you eat affects every aspect of your wellbeing, from energy levels to disease risk.</p>

<h3>Key Nutrients</h3>
<ul>
    <li><strong>Proteins:</strong> Essential for muscle repair and immune function. Sources: lean meats, fish, beans, nuts</li>
    <li><strong>Carbohydrates:</strong> Your body's main energy source. Choose whole grains over refined</li>
    <li><strong>Healthy Fats:</strong> Important for brain health. Sources: olive oil, avocados, fatty fish</li>
    <li><strong>Vitamins & Minerals:</strong> Support various body functions. Eat a variety of colorful foods</li>
</ul>

<h3>The Healthy Plate</h3>
<ul>
    <li>Half your plate: Fruits and vegetables</li>
    <li>Quarter of your plate: Lean protein</li>
    <li>Quarter of your plate: Whole grains</li>
    <li>Add a serving of dairy or calcium-rich alternatives</li>
</ul>

<h3>Tips for Success</h3>
<ul>
    <li>Plan your meals ahead of time</li>
    <li>Cook more meals at home</li>
    <li>Read nutrition labels</li>
    <li>Stay hydrated with water</li>
    <li>Practice mindful eating</li>
</ul>''',
                'category': 'nutrition',
                'is_featured': False,
                'is_published': True,
            },
            {
                'title': 'COVID-19: What You Need to Know',
                'slug': 'covid-19-what-you-need-to-know',
                'summary': 'Stay informed about COVID-19 prevention, symptoms, and when to seek medical care.',
                'content': '''<h2>Staying Safe from COVID-19</h2>
<p>While we've learned to live with COVID-19, it's still important to take precautions, especially for vulnerable populations.</p>

<h3>Prevention Measures</h3>
<ul>
    <li>Stay up to date with vaccinations and boosters</li>
    <li>Wash hands frequently with soap and water</li>
    <li>Wear masks in crowded indoor spaces when cases are high</li>
    <li>Maintain good ventilation indoors</li>
    <li>Stay home if you're feeling unwell</li>
</ul>

<h3>Common Symptoms</h3>
<ul>
    <li>Fever or chills</li>
    <li>Cough</li>
    <li>Shortness of breath</li>
    <li>Fatigue</li>
    <li>Body aches</li>
    <li>Loss of taste or smell</li>
</ul>

<h3>When to Seek Care</h3>
<p>Contact your healthcare provider or seek emergency care if you experience:</p>
<ul>
    <li>Difficulty breathing</li>
    <li>Persistent chest pain or pressure</li>
    <li>Confusion</li>
    <li>Inability to stay awake</li>
</ul>''',
                'category': 'covid',
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Sleep Better Tonight: Tips for Quality Rest',
                'slug': 'sleep-better-tonight',
                'summary': 'Discover science-backed strategies for improving your sleep quality and feeling more rested.',
                'content': '''<h2>The Science of Sleep</h2>
<p>Quality sleep is essential for physical health, mental well-being, and cognitive function. Adults need 7-9 hours of sleep per night.</p>

<h3>Sleep Hygiene Tips</h3>
<ul>
    <li><strong>Stick to a schedule:</strong> Go to bed and wake up at the same time daily</li>
    <li><strong>Create a restful environment:</strong> Keep your bedroom cool, dark, and quiet</li>
    <li><strong>Limit screen time:</strong> Avoid phones and computers 1 hour before bed</li>
    <li><strong>Watch your diet:</strong> Avoid caffeine after 2pm and heavy meals before bed</li>
    <li><strong>Exercise regularly:</strong> But not too close to bedtime</li>
</ul>

<h3>Creating a Bedtime Routine</h3>
<ul>
    <li>Start winding down 30-60 minutes before bed</li>
    <li>Take a warm bath or shower</li>
    <li>Read a book (paper, not screen)</li>
    <li>Practice relaxation techniques like deep breathing</li>
    <li>Keep a gratitude journal</li>
</ul>

<h3>When to See a Doctor</h3>
<p>If you consistently have trouble sleeping or feel tired despite adequate sleep time, consult a healthcare provider to rule out sleep disorders.</p>''',
                'category': 'sleep',
                'is_featured': False,
                'is_published': True,
            },
        ]
        
        for article_data in articles:
            HealthArticle.objects.get_or_create(
                slug=article_data['slug'],
                defaults=article_data
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(articles)} health articles'))
        
        # Create Privacy Policy
        PrivacyPolicy.objects.get_or_create(
            version='1.0',
            defaults={
                'title': 'Privacy Policy',
                'content': '''<h2>Healthcare Portal Privacy Policy</h2>
<p>Last updated: December 2024</p>

<h3>Information We Collect</h3>
<p>We collect information you provide directly to us, including personal information such as your name, email address, and health data you choose to share.</p>

<h3>How We Use Your Information</h3>
<ul>
    <li>To provide, maintain, and improve our services</li>
    <li>To communicate with you about your health goals</li>
    <li>To send you reminders and notifications</li>
</ul>

<h3>Data Security</h3>
<p>We implement industry-standard security measures to protect your health information in compliance with HIPAA regulations.</p>

<h3>Your Rights</h3>
<p>You have the right to access, correct, or delete your personal information at any time.</p>''',
                'effective_date': timezone.now().date(),
                'is_active': True,
            }
        )
        self.stdout.write(self.style.SUCCESS('Created privacy policy'))
        
        # Create FAQs
        faqs = [
            {
                'question': 'How do I track my wellness goals?',
                'answer': 'Log in to your dashboard and navigate to the "My Goals" section. From there, you can create new goals, log your daily progress, and view your achievements over time.',
                'category': 'wellness',
                'order': 1,
            },
            {
                'question': 'How is my health data protected?',
                'answer': 'We use enterprise-grade encryption for all data transmission and storage. Our systems comply with HIPAA regulations, and we never share your personal health information without your explicit consent.',
                'category': 'privacy',
                'order': 2,
            },
            {
                'question': 'Can I connect with my doctor through this platform?',
                'answer': 'Yes! If your healthcare provider is registered on our platform, they can view your wellness progress and provide personalized guidance. You control what information is shared.',
                'category': 'general',
                'order': 3,
            },
            {
                'question': 'How do preventive care reminders work?',
                'answer': 'You can set up reminders for important health appointments, vaccinations, and screenings. We\'ll send you notifications via email to help you stay on track with your preventive care schedule.',
                'category': 'wellness',
                'order': 4,
            },
            {
                'question': 'Is the platform free to use?',
                'answer': 'Yes, our basic wellness tracking features are completely free for patients. We believe everyone should have access to tools that help them manage their health.',
                'category': 'general',
                'order': 5,
            },
        ]
        
        for faq_data in faqs:
            FAQ.objects.get_or_create(
                question=faq_data['question'],
                defaults=faq_data
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(faqs)} FAQs'))
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))
