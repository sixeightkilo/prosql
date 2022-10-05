package db

import (
	"context"
	"database/sql"
	//"errors"
	"os"
	//"strconv"

	"github.com/kargirwar/golang/utils"
	_ "github.com/mattn/go-sqlite3"
	"path/filepath"
	//"net/mail"
)

var dbPath string

func SetDbPath(path string) {
	dbPath = path
}

func OpenDb(ctx context.Context, db string) (*sql.DB, error) {
	utils.Dbg(ctx, "OpenDb")
	db = filepath.Join(dbPath, db)

	_, err := os.OpenFile(db, os.O_RDWR, 0600)

	if err != nil {
		return nil, err
	}

	return sql.Open("sqlite3", "file:"+db+"?_foreign_keys=true")
}
