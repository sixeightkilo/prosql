package device

import (
	"context"
	"database/sql"
	//"fmt"
	utils "github.com/kargirwar/golang/utils"
	_ "github.com/mattn/go-sqlite3"
	//"strconv"
)

type Device struct {
	Id int64`json:"id"`
	DeviceId string	`json:"device_id"`
	UserId int64 `json:"user_id"`
	Version string `json:"version"`
	Os string `json:"os"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func SetUserId(ctx context.Context, db *sql.DB, deviceId string, userId int64) error {
	stmt, err :=
		db.Prepare("update devices set user_id = ? where device_id = ?")

	if err != nil {
		utils.Dbg(ctx, err.Error())
		return err
	}

	_, err = stmt.Exec(userId, deviceId)

	if err != nil {
		utils.Dbg(ctx, err.Error())
		return err
	}

	return nil
}
