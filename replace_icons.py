import os
import re

files_to_modify = [
    r'd:\backend (3)\public\index.html',
    r'd:\backend (3)\public\mlm-database.html',
    r'd:\backend (3)\public\mlm-videomaking.html',
    r'd:\backend (3)\public\mlm-leader-website.html',
    r'd:\backend (3)\public\plan-pdf.html',
    r'd:\backend (3)\public\result-based-promotion.html'
]

social_rail = '''  <aside aria-label="Follow VK Services Enterprise"
    class="social-rail fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
    <a href="https://www.youtube.com/c/MLMSUCCESSTIPS/videos" target="_blank" rel="noopener" aria-label="YouTube"
      class="w-12 h-12 rounded-full text-white ring-2 ring-white/70 flex items-center justify-center transition-all duration-300 hover:-translate-x-1.5 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-200" style="background: linear-gradient(to bottom right, #ff4d4d, #cc0000);">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" /></svg>
      <span class="social-tooltip">YouTube</span>
    </a>
    <a href="#" aria-label="Instagram" title="Add your Instagram profile link"
      class="w-12 h-12 rounded-full text-white ring-2 ring-white/70 flex items-center justify-center transition-all duration-300 hover:-translate-x-1.5 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-200" style="background: linear-gradient(to bottom right, #833ab4, #fd1d1d, #fcb045);">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>
      <span class="social-tooltip">Instagram</span>
    </a>
    <a href="#" aria-label="Facebook" title="Add your Facebook profile link"
      class="w-12 h-12 rounded-full text-white ring-2 ring-white/70 flex items-center justify-center transition-all duration-300 hover:-translate-x-1.5 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200" style="background: linear-gradient(to bottom right, #4a95ff, #1354c9);">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" /></svg>
      <span class="social-tooltip">Facebook</span>
    </a>
  </aside>'''

whatsapp_float = '''  <a href="https://wa.me/918927656368" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"
    class="whatsapp-float fixed left-4 bottom-6 z-40 h-14 rounded-full text-white flex items-center px-4 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-200">
    <svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 24l6.334-1.66A11.94 11.94 0 0 0 12.004 24C18.63 24 24 18.627 24 12S18.63 0 12.004 0zm6.998 16.977c-.297.836-1.47 1.53-2.41 1.73-.64.137-1.478.246-4.297-.923-3.607-1.494-5.927-5.156-6.108-5.395-.174-.24-1.463-1.948-1.463-3.715 0-1.767.93-2.635 1.257-2.996.328-.36.716-.45.955-.45.24 0 .478.002.687.013.221.011.517-.084.808.618.297.716.997 2.475 1.084 2.654.088.18.146.39.03.63-.117.24-.176.39-.35.598-.174.211-.365.469-.523.63-.174.176-.356.365-.153.716.204.351.905 1.494 1.943 2.42 1.335 1.19 2.462 1.559 2.813 1.734.35.176.554.15.758-.09.204-.24.876-1.02 1.11-1.37.234-.35.468-.29.79-.174.32.117 2.033.958 2.382 1.132.35.176.583.263.67.41.088.15.088.855-.21 1.68z"/>
    </svg>
    <span class="wa-label text-sm font-bold">Chat on WhatsApp</span>
  </a>'''

for fpath in files_to_modify:
    if not os.path.exists(fpath):
        print(f'{fpath} does not exist!')
        continue
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove AI Assistant block
    # from <!-- AI Assistant --> to </form>\s*</div>
    content = re.sub(r'<!--\s*AI Assistant\s*-->.*?<div[^>]*id=\"aiPanel\".*?</form>\s*</div>', '', content, flags=re.DOTALL)
    
    # 2. Replace Get In Touch button and style with social rail
    # Match the <!-- Side Tab --> ... </style> block
    if 'id="sideTab"' in content:
        content = re.sub(r'<!--\s*Side Tab\s*-->.*?<button id=\"sideTab\".*?</style>', social_rail, content, flags=re.DOTALL)
        # Just in case there's no comment before the sideTab
        if '<button id="sideTab"' in content:
            content = re.sub(r'<button id=\"sideTab\".*?</style>', social_rail, content, flags=re.DOTALL)
    
    # 3. Replace Live Session button with whatsapp float
    # Note: We should match <!-- LIVE SESSION MODAL --> and remove it if the user doesn't want the modal either.
    # The user said "remove the ... live session icon ... add whatsapp icon at the place of live session"
    # The Live Session modal is huge. Let's leave the modal HTML for now or just replace the button.
    # The modal doesn't hurt if it's hidden, but we should replace the button for sure.
    if 'id="liveSessionBtn"' in content:
        content = re.sub(r'<button[^>]*id=\"liveSessionBtn\"[^>]*>.*?</button>', whatsapp_float, content, flags=re.DOTALL)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Processed {fpath}')
