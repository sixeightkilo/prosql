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

func Save(ctx context.Context, db *sql.DB, d Device) (int64, error) {
	//first check if the device exists
	devices, err := GetByDeviceId(ctx, db, d.DeviceId)
	if err != nil {
		return -1, err
	}

	if len(*devices) == 1 {
		return (*devices)[0].Id, nil
	}

	//start transaction
	tx, err := db.Begin()
	if err != nil {
		return -1, err
	}

	id, err := insertQuery(ctx, tx, d)
	if err != nil {
		tx.Rollback()
		return -1, err
	}

	tx.Commit()

	return id, nil
}

func GetByDeviceId(ctx context.Context, db *sql.DB, deviceId string) (*[]Device, error) {
	var devices []Device
	query := `
		select id, device_id, version, os, created_at, updated_at
		from
		  devices where device_id = ?`

	rows, err := db.Query(query, deviceId)

	if err != nil {
		utils.Dbg(ctx, err.Error())
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var d Device
		err := rows.Scan(
			&d.Id, &d.DeviceId, &d.Version, &d.Os, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			utils.Dbg(ctx, err.Error())
			return nil, err
		}

		devices = append(devices, d)
	}

	return &devices, nil
}

func insertQuery(ctx context.Context, tx *sql.Tx, d Device) (int64, error) {
	sql := `insert into devices (device_id, version, os)
		values (?, ?, ?)`

	stmt, err := tx.Prepare(sql)
	if err != nil {
		return -1, err
	}

	res, err := stmt.Exec(d.DeviceId, d.Version, d.Os)

	if err != nil {
		return -1, err
	}

	defer stmt.Close()

	id, err := res.LastInsertId()

	if err != nil {
		return -1, err
	}

	return id, nil
}

