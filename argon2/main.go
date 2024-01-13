package main

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strings"
	"syscall/js"

	"golang.org/x/crypto/argon2"
)

const (
	time    uint32 = 1
	memory  uint32 = 64 * 1024
	threads uint8  = 1
	keyLen  uint32 = 32
)

func main() {
	js.Global().Set("hash", js.FuncOf(func(this js.Value, args []js.Value) any {
		password := args[0]
		return js.ValueOf(hash(password.String()))
	}))
	js.Global().Set("verify", js.FuncOf(func(this js.Value, args []js.Value) any {
		password := args[0]
		hash := args[1]
		return js.ValueOf(verify(password.String(), hash.String()))
	}))
	select {}
}

func hash(password string) string {
	salt := generateRandomSalt(16)
	key := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLen)
	encodedSalt := base64.RawStdEncoding.EncodeToString(salt)
	encodedKey := base64.RawStdEncoding.EncodeToString(key)
	return fmt.Sprintf("$argon2id$v=%v$m=%v,t=%v,p=%v$%v$%v", argon2.Version, memory, time, threads, encodedSalt, encodedKey)
}

func verify(password string, hash string) bool {
	version := 0
	memory := uint32(0)
	time := uint32(0)
	threads := uint8(0)
	encoded := ""
	fmt.Sscanf(hash, "$argon2id$v=%v$m=%v,t=%v,p=%v$%s", &version, &memory, &time, &threads, &encoded)
	if version != argon2.Version {
		return false
	}

	s := strings.Split(encoded, "$")
	encodedSalt := s[0]
	encodedKey := s[1]
	salt, _ := base64.RawStdEncoding.DecodeString(encodedSalt)
	key, _ := base64.RawStdEncoding.DecodeString(encodedKey)

	newKey := argon2.IDKey([]byte(password), salt, time, memory, threads, uint32(len(key)))
	return subtle.ConstantTimeCompare(key, newKey) == 1
}

func generateRandomSalt(length int) []byte {
	buf := make([]byte, length)
	rand.Read(buf)
	return buf
}
