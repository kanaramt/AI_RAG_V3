import subprocess
import sys
import shutil

def check_command(cmd):
    return shutil.which(cmd) is not None

def run_localtunnel(port):
    print(f"\n🚀 Starting Localtunnel on port {port}...")
    print("This will expose your local server to the internet.")
    print("If prompted, enter 'y' to install the 'localtunnel' package.")
    print("Press Ctrl+C to stop the tunnel.\n")
    try:
        # Run npx localtunnel --port <port>
        subprocess.run(["npx", "localtunnel", "--port", str(port)])
    except KeyboardInterrupt:
        print("\n👋 Tunnel stopped.")

def run_pinggy(port):
    print(f"\n🚀 Starting Pinggy Tunnel on port {port}...")
    print("This uses SSH to create a secure tunnel. Zero installation needed.")
    print("Press Ctrl+C to stop the tunnel.\n")
    try:
        # Run ssh -R 80:localhost:<port> loop.pinggy.io
        subprocess.run(["ssh", "-R", f"80:localhost:{port}", "loop.pinggy.io"])
    except KeyboardInterrupt:
        print("\n👋 Tunnel stopped.")

def run_localhost_run(port):
    print(f"\n🚀 Starting Localhost.run Tunnel on port {port}...")
    print("This uses SSH to create a secure tunnel. Zero installation needed.")
    print("Press Ctrl+C to stop the tunnel.\n")
    try:
        # Run ssh -R 80:localhost:<port> nokey@localhost.run
        subprocess.run(["ssh", "-R", f"80:localhost:{port}", "nokey@localhost.run"])
    except KeyboardInterrupt:
        print("\n👋 Tunnel stopped.")

def run_ngrok(port):
    if not check_command("ngrok"):
        print("\n❌ 'ngrok' command not found on your system.")
        print("To use ngrok:")
        print("  1. Install it via Homebrew: brew install ngrok")
        print("  2. Sign up at https://ngrok.com and get your auth token")
        print("  3. Run: ngrok config add-authtoken <your-token>")
        print("  4. Run this script again or run: ngrok http 8080")
        return
    
    print(f"\n🚀 Starting ngrok tunnel on port {port}...")
    print("Press Ctrl+C to stop the tunnel.\n")
    try:
        subprocess.run(["ngrok", "http", str(port)])
    except KeyboardInterrupt:
        print("\n👋 Tunnel stopped.")

def main():
    print("==================================================")
    print("🌐  BhavnaCorp's RAG Cloud Tunnel Deployment Helper  🌐")
    print("==================================================")
    
    # Default port from active server (detected as 8080 in metadata)
    port = 8080
    port_input = input(f"Enter the port your application is running on [{port}]: ").strip()
    if port_input:
        try:
            port = int(port_input)
        except ValueError:
            print("Invalid port number. Using default port 8080.")
            port = 8080

    # Detect available utilities
    npx_available = check_command("npx")
    ssh_available = check_command("ssh")
    ngrok_available = check_command("ngrok")

    print("\nDetecting local tunneling tools:")
    print(f"  [+] Node/npx:  {'Available ✅' if npx_available else 'Not Found ❌'}")
    print(f"  [+] SSH client: {'Available ✅' if ssh_available else 'Not Found ❌'}")
    print(f"  [+] ngrok CLI:  {'Available ✅' if ngrok_available else 'Not Found ❌'}")
    print("-" * 50)
    
    options = []
    if npx_available:
        options.append(("Localtunnel (Free, runs via npx)", run_localtunnel))
    if ssh_available:
        options.append(("Pinggy (Free, SSH-based, zero setup)", run_pinggy))
        options.append(("Localhost.run (Free, SSH-based, zero setup)", run_localhost_run))
    options.append(("ngrok (Requires ngrok account & installation)", run_ngrok))

    print("Please choose a tunneling method:")
    for idx, (name, _) in enumerate(options, start=1):
        print(f"  {idx}. {name}")
    print(f"  {len(options) + 1}. Exit")

    try:
        choice = input(f"Enter your choice (1-{len(options) + 1}): ").strip()
        choice_idx = int(choice) - 1
        if choice_idx == len(options) or choice_idx < 0:
            print("Exiting...")
            sys.exit(0)
        if 0 <= choice_idx < len(options):
            _, fn = options[choice_idx]
            fn(port)
        else:
            print("Invalid choice. Exiting.")
    except (ValueError, IndexError):
        print("Invalid input. Exiting.")
    except KeyboardInterrupt:
        print("\n👋 Exiting...")

if __name__ == "__main__":
    main()
