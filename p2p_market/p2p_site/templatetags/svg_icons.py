from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.simple_tag
def svg_icon(name, width=30, height=30, extra_classes=""):
    icons = {
        'notification': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path class="evJ6XQ" fill="currentColor" d="M13.5 19H15a3 3 0 0 1-6 0h1.5a1.5 1.5 0 0 0 3 0z"></path>
                <path class="x9EzJQ" fill="currentColor" fill-rule="evenodd" d="M20.04 17.5h.21a.75.75 0 1 1 0 1.5H3.75a.75.75 0 1 1 0-1.5h.21c1-1.15 1.82-2.7 1.82-5.97v-1.3a6.22 6.22 0 0 1 4.87-6.08 1.5 1.5 0 1 1 2.7 0 6.22 6.22 0 0 1 4.87 6.07v1.3c0 3.27.83 4.82 1.82 5.98zm-1.87 0c-.99-1.52-1.45-3.3-1.45-5.97v-1.3a4.72 4.72 0 0 0-9.44 0v1.3c0 2.67-.46 4.45-1.45 5.97h12.34z"></path>
                <circle cx="18" cy="6" r="6" fill="#1a90f5"/>
                <text id="notificationItemCount" x="18" y="8" font-size="8" text-anchor="middle" fill="white">0</text>
            </svg>
        ''',
        'mailbox': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M22 12h-6l-2 3h-4l-2-3H2"/>
                <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                <circle cx="18" cy="6" r="6" fill="#1a90f5"/>
                <text id="inboxItemCount" x="18" y="8" font-size="8" text-anchor="middle" fill="white">0</text>
            </svg>
        ''',
        'cart': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path fill="none" stroke="black" stroke-width="1.5" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                <circle cx="18" cy="6" r="6" fill="#1a90f5"/>
                <text class="cartItemCount" x="18" y="8" font-size="8" text-anchor="middle" fill="white">0</text>
            </svg>
        ''',
        'user': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user {extra_classes}">
                <path d="M20.9 21a8.9 8.9 0 0 0-17.8 0"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        ''',
        'search': '''
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="{width}" height="{height}" class="{extra_classes}">
                <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        ''',
        'username': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path fill="currentColor" d="M12 2a5 5 0 1 1 0 10 5 5 0 1 1 0-10zm-7 20a7 7 0 1 1 14 0H5z"/>
            </svg>
        ''',
        'password': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path fill="currentColor" d="M17 9V7a5 5 0 0 0-10 0v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2zM9 7a3 3 0 0 1 6 0v2H9V7zm10 13H5v-7h14v7zm-7-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
            </svg>
        ''',
        'phone': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                    <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
        ''',
        'location': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        ''',
        'email': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="{extra_classes}">
                <path fill="currentColor" d="M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.01L12 13l9-7V6H3zm0 12h18V8.09l-9 7-9-7V18z"/>
            </svg>
        ''',
        'heart': '''
            <svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 24 24" class="heart-icon {extra_classes}">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        ''',
        'trash': '''
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="{width}" height="{height}" class="{extra_classes}">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        '''
    }
    
    if name not in icons:
        return ''
    
    svg = icons[name].format(width=width, height=height, extra_classes=extra_classes)
    return mark_safe(svg)