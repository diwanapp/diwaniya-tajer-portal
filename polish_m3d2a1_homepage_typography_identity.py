from pathlib import Path

# 1) Unify global font identity: IBM Plex Sans Arabic first.
globals_path = Path("app/globals.css")
globals_css = globals_path.read_text(encoding="utf-8")

globals_css = globals_css.replace(
    "font-family: 'Tajawal', ui-sans-serif, system-ui, sans-serif;",
    "font-family: 'IBM Plex Sans Arabic', 'Tajawal', ui-sans-serif, system-ui, sans-serif;",
)

globals_css = globals_css.replace(
    "font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;",
    "font-family: 'IBM Plex Sans Arabic', 'Tajawal', ui-sans-serif, system-ui, sans-serif;",
)

globals_path.write_text(globals_css, encoding="utf-8")
print("Updated global font to IBM Plex Sans Arabic first.")


# 2) Unify Tailwind font stack.
tailwind_path = Path("tailwind.config.ts")
tailwind = tailwind_path.read_text(encoding="utf-8")

tailwind = tailwind.replace(
    'sans: ["Tajawal", "ui-sans-serif", "system-ui", "sans-serif"],',
    'sans: ["IBM Plex Sans Arabic", "Tajawal", "ui-sans-serif", "system-ui", "sans-serif"],',
)

tailwind_path.write_text(tailwind, encoding="utf-8")
print("Updated Tailwind sans font stack.")


# 3) Polish homepage hero typography and layout.
page_path = Path("app/page.tsx")
page = page_path.read_text(encoding="utf-8")

old = '''              <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight lg:text-7xl">
                اعرض منتجاتك وخدماتك للديوانيات القريبة منك
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-9 text-ivory-100/78">
                منصة عملية للتجار لإدارة المتجر، المنتجات، الأسعار، المخزون، وطلبات الإعلانات داخل سوق ديوانية.
              </p>
'''

new = '''              <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.18] tracking-tight text-ivory-50 lg:text-6xl">
                <span className="block whitespace-nowrap">اعرض منتجاتك وخدماتك</span>
                <span className="mt-2 block whitespace-nowrap">للديوانيات القريبة منك</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-ivory-100/76 lg:text-lg">
                منصة عملية للتجار لإدارة المتجر، المنتجات، الأسعار، المخزون، وطلبات الإعلانات داخل سوق ديوانية.
              </p>
'''

if old not in page:
    raise RuntimeError("Could not find homepage hero title block.")

page = page.replace(old, new, 1)

# Reduce hero visual height slightly.
page = page.replace(
    'grid min-h-[650px] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16',
    'grid min-h-[600px] items-center gap-12 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-14',
)

# Reduce preview card max width a little to calm the composition.
page = page.replace(
    'relative mx-auto w-full max-w-[560px]',
    'relative mx-auto w-full max-w-[520px]',
)

# Slightly reduce metric card title inside preview.
page = page.replace(
    'h2 className="mt-1 text-2xl font-black text-navy-900"',
    'h2 className="mt-1 text-xl font-black text-navy-900"',
)

page_path.write_text(page, encoding="utf-8")
print("Polished homepage typography and hero balance.")