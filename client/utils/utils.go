package utils

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
)

// Decode decodes the input from base64
func Decode(in string, obj interface{}) {
	b, err := base64.StdEncoding.DecodeString(in)
	if err != nil {
		panic(err)
	}

	err = json.Unmarshal(b, obj)
	if err != nil {
		panic(err)
	}
}

// Encode encodes the input in base64
func Encode(obj interface{}) string {
	b, err := json.Marshal(obj)
	if err != nil {
		panic(err)
	}

	return base64.StdEncoding.EncodeToString(b)
}

func SelectScript() string {
	cmd, err := exec.Command("cat", "/sys/firmware/devicetree/base/model").Output()
	if err != nil {
		fmt.Println(err.Error())
		return "./teststream"
	}
	str := string(cmd)

	if strings.Contains(str, "Raspberry") {
		fmt.Println("camera stream selected")
		return "./camerastream"
	}
	fmt.Println("Not a Raspberry Pi")
	return "./teststream"
}
