package user


import (
	"context"
	"database/sql"
	//"fmt"
	utils "github.com/kargirwar/golang/utils"
	_ "github.com/mattn/go-sqlite3"
	//"strconv"
)

const MAX_GUEST_DAYS = 15
const GUEST_FIRST_NAME = "Guest";
const GUEST_LAST_NAME = "";
const GUEST_EMAIL = "guest@prosql.io";

type User struct {
	Id int64 `json:"id"`
	FirstName string `json:"first_name"`
	LastName string `json:"last_name"`
	Email string `json:"email"`
}

func Save(ctx context.Context, db *sql.DB, u User) (int64, error) {
	//start transaction
	tx, err := db.Begin()
	if err != nil {
		return -1, err
	}

	id, err := insertQuery(ctx, tx, u)
	if err != nil {
		tx.Rollback()
		return -1, err
	}

	tx.Commit()

	return id, nil
}

func insertQuery(ctx context.Context, tx *sql.Tx, u User) (int64, error) {
	sql := `insert into users (first_name, last_name, email)
		values (?, ?, ?)`

	stmt, err := tx.Prepare(sql)
	if err != nil {
		return -1, err
	}

	res, err := stmt.Exec(u.FirstName, u.LastName, u.Email)

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

func GetByEmail(ctx context.Context, db *sql.DB, email string) (*[]User, error) {
	var users []User
	query := `
		select id, first_name, last_name, email
		from
		  users where email = ?`

	rows, err := db.Query(query, email)

	if err != nil {
		utils.Dbg(ctx, err.Error())
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var u User
		err := rows.Scan(&u.Id, &u.FirstName, &u.LastName, &u.Email)
		if err != nil {
			utils.Dbg(ctx, err.Error())
			return nil, err
		}

		users = append(users, u)
	}

	return &users, nil
}
