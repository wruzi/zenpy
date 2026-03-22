import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # CSS Changes for docs
    text = text.replace('border-radius: 12px;', 'border-radius: 0;')
    text = text.replace('border-radius: 8px;', 'border-radius: 0;')
    text = text.replace('font-size: 0.95rem;', 'font-size: 1.6rem; color: var(--accent);')
    text = text.replace('font-size: 0.82rem;', 'font-size: 1.15rem;')
    text = text.replace('font-size: 0.76rem;', 'font-size: 1.05rem;')
    
    # Shadows without blur
    text = text.replace('box-shadow: var(--shadow);', 'box-shadow: 4px 4px 0px var(--accent-dim);')
    text = text.replace('box-shadow: var(--shadow-lg);', 'box-shadow: 6px 6px 0px var(--accent-dim);')

    # Add sticky explicitly if missing or modify existing
    text = text.replace('position: sticky;\n            top: 14px;', 'position: sticky;\n            top: 14px;\n            align-self: start;')
    
    # Code coloring
    text = re.sub(r'def (\w+)', r'<span class="keyword">def</span> <span class="fn">\1</span>', text)
    text = re.sub(r'class (\w+)', r'<span class="keyword">class</span> <span class="fn">\1</span>', text)
    text = re.sub(r'return ', r'<span class="keyword">return</span> ', text)
    text = re.sub(r'for (\w+) in ', r'<span class="keyword">for</span> \1 <span class="keyword">in</span> ', text)
    text = re.sub(r'if (.*?):', r'<span class="keyword">if</span> \1:', text)
    text = re.sub(r'elif (.*?):', r'<span class="keyword">elif</span> \1:', text)
    text = re.sub(r'else:', r'<span class="keyword">else</span>:', text)
    text = re.sub(r'print\(', r'<span class="fn">print</span>(', text)
    
    # Add theme switcher right before the end of body
    theme_switcher = '''
    <button class="theme-switcher" onclick="document.body.classList.toggle('light-theme')">
        Toggle Theme
    </button>
    '''
    if 'theme-switcher' not in text:
        text = text.replace('</body>', f'{theme_switcher}\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

update_file('../frontend/public/docs.html')

def update_index(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    new_section = '''
    <section class="section" style="border: 2px solid var(--border); border-radius: 0; box-shadow: 6px 6px 0px var(--accent-dim); margin-bottom: 60px;">
        <div class="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            What is ZenPy?
        </div>
        <p class="section-desc" style="font-size: 1.15rem; line-height: 1.8;">
            ZenPy is not just another platform. It's an entire ecosystem thoughtfully designed to take you from writing basic variables to constructing sequence models. Think of it as a bridge between foundational syntax and applied machine learning. By keeping things gamified, every coding session naturally motivates you to dig deeper, experiment further, and truly grasp the underlying concepts without feeling overwhelmed. 
        </p>
    </section>
    '''
    if 'What is ZenPy?' not in text:
        # insert before the first <section
        text = text.replace('<section id="features"', f'{new_section}\n    <section id="features"')
        
    theme_switcher = '''
    <button class="theme-switcher" onclick="document.body.classList.toggle('light-theme')">
        Toggle Theme
    </button>
    '''
    if 'theme-switcher' not in text:
        text = text.replace('</body>', f'{theme_switcher}\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

update_index('../frontend/public/index.html')
