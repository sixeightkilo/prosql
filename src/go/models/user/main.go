package user

import (
	"context"
	"database/sql"
	//"fmt"
	utils "github.com/kargirwar/golang/utils"
	_ "github.com/mattn/go-sqlite3"
	//"strconv"
)

type User struct {
	Firstname string `json:"first_name"`
	LastName string `json:"last_name"`
	Email string `json:"email"`
}


func GetByEmail(ctx context.Context, db *sql.DB, email string) (*[]User, error) {
	var users []User
	query := `
		select first_name, last_name, email
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
		err := rows.Scan(&u.Firstname, &u.LastName, &u.Email)
		if err != nil {
			utils.Dbg(ctx, err.Error())
			return nil, err
		}

		users = append(users, u)
	}

	return &users, nil
}
