#!/usr/bin/env python3
import getpass
import hashlib
import secrets

if __name__ == "__main__":
    password = getpass.getpass("Panel password (at least 16 characters): ")
    if len(password) < 16:
        raise SystemExit("Use at least 16 characters")
    if password != getpass.getpass("Repeat password: "):
        raise SystemExit("Passwords differ")
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1, dklen=32)
    print(f"scrypt:{salt.hex()}:{digest.hex()}")
