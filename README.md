This is where my website lives, breathes, and thrives. It's not the most technically impressive, but it is something I like adding features to and challenging myself to write for.

Features:
- Draggable windows
- Preemptive multitasking...mostly
- A music player (not my music though, credits to the original composers provided)
- A half-functional Godot tech demo that I coded for a game jam :p
- Custom cursors (not my cursors either, credit goes to SEGA [Miku cursor & new Kagamine Rin cursor] and wobb [old Kagamine Rin cursor])
- An 88x31 button for your linking needs

Roadmap:
- A file viewer for my self-made, AI-free, TerminalMontage and Paper Mario-inspired art
- An internet browser within an internet browser
- A proper form of contact
- And more!


Demo
<img width="2560" height="1407" alt="image" src="https://github.com/user-attachments/assets/8b45195c-5b6a-4cbe-9916-086bf1e92cf0" />

---------------------

Optimization
- This section dedicated mostly for Hack Clubbers' eyes.
- Before the concerted effort that started 3/20, the following techniques were used:
    - Lazy loading of most intensive apps (in the Dock)
    - Base64 encoding of select icons to prevent back-and-forth with the fileserver
- Additional optimization techniques used:
    - Additional lazy loading for iframes, saving up to 450ms in loading time
    - Removing Bootstrap was considered, but measurements showed that loading times and CPU usage actually increased after the fact
- Before
  - <img width="1800" height="1169" alt="Screenshot 2026-03-20 at 3 59 24 PM" src="https://github.com/user-attachments/assets/df1befe9-cc73-45d8-80d4-e7736cbb7fce" />
- After
  - <img width="1800" height="1169" alt="Screenshot 2026-03-20 at 4 02 13 PM" src="https://github.com/user-attachments/assets/56ec74e2-2273-455f-967f-6159660829ab" />

