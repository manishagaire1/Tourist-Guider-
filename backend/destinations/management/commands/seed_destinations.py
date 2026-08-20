from django.core.management.base import BaseCommand
from django.utils.text import slugify

from destinations.models import Destination
from places.models import Category, Place

CATEGORIES = [
    ('Attractions', 'landmark'),
    ('Restaurants', 'utensils-crossed'),
    ('Hotels', 'bed-double'),
    ('Cafés', 'coffee'),
    ('Shopping', 'shopping-bag'),
    ('Museums', 'building-2'),
    ('Beaches', 'waves'),
    ('Parks', 'trees'),
    ('Temples', 'landmark'),
    ('Historical Places', 'scroll'),
    ('Adventure', 'mountain'),
    ('Nightlife', 'martini'),
]

DESTINATIONS = [
    {
        'name': 'Tokyo', 'country': 'Japan', 'rating': 4.8, 'best_time_to_visit': 'March – May',
        'latitude': 35.6762, 'longitude': 139.6503,
        'description': "Japan's neon-lit capital, blending ancient temples with futuristic skyscrapers.",
        'interests': ['culture', 'food', 'shopping', 'nightlife'],
        'places': [
            ('Senso-ji Temple', 'Temples', 4.7, '$', 'Ancient Buddhist temple in historic Asakusa.', 35.7148, 139.7967),
            ('Tokyo Skytree', 'Attractions', 4.6, '$$', 'Iconic broadcast tower with panoramic city views.', 35.7101, 139.8107),
        ],
    },
    {
        'name': 'Kyoto', 'country': 'Japan', 'rating': 4.9, 'best_time_to_visit': 'March – May, Oct – Nov',
        'latitude': 35.0116, 'longitude': 135.7681,
        'description': "Japan's cultural heart — thousands of temples, shrines, and historic geisha districts.",
        'interests': ['culture', 'history', 'photography'],
        'places': [
            ('Fushimi Inari Shrine', 'Temples', 4.8, '$', 'Famous shrine with thousands of vermillion torii gates.', 34.9671, 135.7727),
            ('Arashiyama Bamboo Grove', 'Parks', 4.6, '$', 'A serene, towering bamboo forest path.', 35.0094, 135.6683),
        ],
    },
    {
        'name': 'Osaka', 'country': 'Japan', 'rating': 4.6, 'best_time_to_visit': 'April – May',
        'latitude': 34.6937, 'longitude': 135.5023,
        'description': "A food-lover's paradise known for street eats, nightlife, and Osaka Castle.",
        'interests': ['food', 'nightlife', 'culture'],
        'places': [
            ('Osaka Castle', 'Historical Places', 4.5, '$', "One of Japan's most iconic historical landmarks.", 34.6873, 135.5262),
            ('Dotonbori', 'Nightlife', 4.6, '$$', 'Neon-lit dining and entertainment district.', 34.6687, 135.5012),
        ],
    },
    {
        'name': 'Fukuoka', 'country': 'Japan', 'rating': 4.5, 'best_time_to_visit': 'March – May, Sept – Nov',
        'latitude': 33.5904, 'longitude': 130.4017,
        'description': 'A laid-back coastal city famous for tonkotsu ramen, beaches, and easy nature access.',
        'interests': ['food', 'nature'],
        'places': [
            ('Ohori Park', 'Parks', 4.4, '$', 'Scenic lakeside park in the heart of the city.', 33.5845, 130.3808),
            ('Yatai Food Stalls', 'Restaurants', 4.7, '$', 'Open-air street food stalls serving local specialties.', 33.5926, 130.4092),
        ],
    },
    {
        'name': 'Paris', 'country': 'France', 'rating': 4.7, 'best_time_to_visit': 'April – June, Sept – Oct',
        'latitude': 48.8566, 'longitude': 2.3522,
        'description': 'The City of Light — iconic landmarks, world-class art, and unforgettable cuisine.',
        'interests': ['culture', 'history', 'food', 'shopping'],
        'places': [
            ('Eiffel Tower', 'Attractions', 4.7, '$$', "The world-famous iron lattice tower on the Champ de Mars.", 48.8584, 2.2945),
            ('Louvre Museum', 'Museums', 4.8, '$$', "The world's largest art museum, home to the Mona Lisa.", 48.8606, 2.3376),
        ],
    },
    {
        'name': 'London', 'country': 'United Kingdom', 'rating': 4.6, 'best_time_to_visit': 'May – Sept',
        'latitude': 51.5072, 'longitude': -0.1276,
        'description': 'A historic global capital packed with museums, royal landmarks, and diverse culture.',
        'interests': ['culture', 'history', 'shopping'],
        'places': [
            ('British Museum', 'Museums', 4.8, '$', 'World-renowned museum of human history and culture.', 51.5194, -0.1270),
            ('Tower Bridge', 'Attractions', 4.7, '$', 'Iconic Victorian bascule bridge over the Thames.', 51.5055, -0.0754),
        ],
    },
    {
        'name': 'New York', 'country': 'United States', 'rating': 4.7, 'best_time_to_visit': 'April – June, Sept – Nov',
        'latitude': 40.7128, 'longitude': -74.0060,
        'description': 'The city that never sleeps — an iconic skyline, Broadway, and nonstop energy.',
        'interests': ['nightlife', 'shopping', 'culture'],
        'places': [
            ('Central Park', 'Parks', 4.8, '$', 'Sprawling urban park in the middle of Manhattan.', 40.7829, -73.9654),
            ('Times Square', 'Attractions', 4.5, '$$', 'The dazzling, billboard-lit heart of NYC.', 40.7580, -73.9855),
        ],
    },
    {
        'name': 'Dubai', 'country': 'United Arab Emirates', 'rating': 4.6, 'best_time_to_visit': 'Nov – March',
        'latitude': 25.2048, 'longitude': 55.2708,
        'description': 'A futuristic desert metropolis of record-breaking skyscrapers and luxury shopping.',
        'interests': ['shopping', 'adventure', 'nightlife'],
        'places': [
            ('Burj Khalifa', 'Attractions', 4.8, '$$$', "The world's tallest building, with an observation deck.", 25.1972, 55.2744),
            ('Dubai Mall', 'Shopping', 4.6, '$$', 'One of the largest shopping malls on Earth.', 25.1975, 55.2796),
        ],
    },
    {
        'name': 'Kathmandu', 'country': 'Nepal', 'rating': 4.5, 'best_time_to_visit': 'Sept – Nov, March – April',
        'latitude': 27.7172, 'longitude': 85.3240,
        'description': 'Gateway to the Himalayas, rich with ancient temples and mountain adventure.',
        'interests': ['adventure', 'culture', 'nature'],
        'places': [
            ('Swayambhunath Stupa', 'Temples', 4.7, '$', 'Ancient hilltop stupa overlooking the Kathmandu valley.', 27.7149, 85.2903),
            ('Thamel Market', 'Shopping', 4.4, '$', 'Bustling tourist quarter of shops, cafés, and trekking gear.', 27.7154, 85.3123),
        ],
    },
    {
        'name': 'Sydney', 'country': 'Australia', 'rating': 4.7, 'best_time_to_visit': 'Sept – Nov, March – May',
        'latitude': -33.8688, 'longitude': 151.2093,
        'description': 'A stunning harbor city famous for its Opera House, beaches, and outdoor lifestyle.',
        'interests': ['beaches', 'adventure', 'nature', 'family_travel'],
        'places': [
            ('Sydney Opera House', 'Attractions', 4.8, '$$', 'World-famous performing arts venue on the harbour.', -33.8568, 151.2153),
            ('Bondi Beach', 'Beaches', 4.6, '$', "Sydney's most iconic beach and coastal walk.", -33.8908, 151.2743),
        ],
    },
]


def picsum(seed: str, width: int = 800, height: int = 600) -> str:
    return f'https://picsum.photos/seed/{slugify(seed)}/{width}/{height}'


class Command(BaseCommand):
    help = 'Seed the database with demo destinations, categories, and places.'

    def handle(self, *args, **options):
        categories = {}
        for name, icon in CATEGORIES:
            category, _ = Category.objects.get_or_create(name=name, defaults={'icon': icon})
            categories[name] = category
        self.stdout.write(self.style.SUCCESS(f'{len(categories)} categories ready.'))

        destination_count = 0
        place_count = 0
        for entry in DESTINATIONS:
            destination, _ = Destination.objects.update_or_create(
                name=entry['name'], country=entry['country'],
                defaults={
                    'description': entry['description'],
                    'rating': entry['rating'],
                    'best_time_to_visit': entry['best_time_to_visit'],
                    'latitude': entry['latitude'],
                    'longitude': entry['longitude'],
                    'image_url': picsum(f"{entry['name']}-{entry['country']}"),
                    'interest_tags': entry['interests'],
                },
            )
            destination_count += 1

            for place_name, category_name, rating, price_range, description, lat, lng in entry['places']:
                Place.objects.update_or_create(
                    name=place_name, destination=destination,
                    defaults={
                        'category': categories[category_name],
                        'rating': rating,
                        'price_range': price_range,
                        'description': description,
                        'address': f'{entry["name"]}, {entry["country"]}',
                        'image_url': picsum(place_name),
                        'latitude': lat,
                        'longitude': lng,
                    },
                )
                place_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {destination_count} destinations and {place_count} places.'
        ))
