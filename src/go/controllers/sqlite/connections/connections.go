package connections

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/kargirwar/prosql-agent/utils"
	"github.com/kargirwar/prosql-sqlite/dbutils"
	_ "github.com/mattn/go-sqlite3"
)

type connection struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	User      string `json:"user"`
	Host      string `json:"host"`
	Port      string `json:"port"`
	Db        string `json:"db"`
	IsDefault bool   `json:"is_default"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func (c connection) String() string {
	return fmt.Sprintf("n: %s u: %s h: %s p: %s d: %s i: %t", c.Name, c.User, c.Host, c.Port, c.Db, c.IsDefault)
}

func ConnectionHandler(w http.ResponseWriter, r *http.Request) {
	utils.Dbg(r.Context(), "connectionHandler")

	if r.Method == http.MethodPost {
		handlePost(w, r)
		return
	}

	if r.Method == http.MethodDelete {
		handleDelete(w, r)
		return
	}

	handleGet(w, r)
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	utils.Dbg(r.Context(), "handleDelete")

	db := r.Header.Get("db")

	sqlite, err := dbutils.OpenDb(r.Context(), db)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	defer sqlite.Close()
	defer r.Body.Close()

	if r.Body == nil {
		utils.SendError(r.Context(), w, errors.New("invalid-input"), "invalid-input")
		return
	}

	var ids []int
	err = json.NewDecoder(r.Body).Decode(&ids)
	if err != nil {
		utils.SendError(r.Context(), w, err, "json-error")
		return
	}

	err = markDeleted(r.Context(), sqlite, ids)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	utils.SendSuccess(r.Context(), w, struct {
		Ids []int `json:"ids"`
	}{ids}, false)
}

func markDeleted(ctx context.Context, db *sql.DB, ids []int) error {
	in := ""
	for i, v := range ids {
		if i == len(ids)-1 {
			in += strconv.Itoa(v)
			break
		}

		in = in + strconv.Itoa(v) + ","
	}

	stmt, err :=
		db.Prepare("update connections set status = 200, updated_at = current_timestamp  where id in (" + in + ")")

	if err != nil {
		return err
	}

	_, err = stmt.Exec()

	if err != nil {
		return err
	}

	return nil
}

func handleGet(w http.ResponseWriter, r *http.Request) {
	db := r.Header.Get("db")
	after := r.Header.Get("after")

	sqlite, err := dbutils.OpenDb(r.Context(), db)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}
	defer sqlite.Close()

	connections, err := getConnections(r.Context(), sqlite, after)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	utils.SendSuccess(r.Context(), w, struct {
		Connections *[]connection `json:"connections"`
	}{connections}, false)
}

func getConnections(ctx context.Context, db *sql.DB, after string) (*[]connection, error) {
	var connections []connection
	utils.Dbg(ctx, fmt.Sprintf("after: %s", after))

	rows, err := db.Query(`select a.id, a.name, a.user, a.host, a.port, a.db, a.is_default, b.status, 
	a.created_at, a.updated_at
	from connections a inner join statuses b on a.status = b.id where updated_at > datetime(?)`, after)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var c connection
		err := rows.Scan(&c.Id, &c.Name, &c.User, &c.Host, &c.Port, &c.Db, &c.IsDefault, &c.Status,
			&c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		utils.Dbg(ctx, c.String())
		connections = append(connections, c)
	}

	return &connections, nil
}

func handlePost(w http.ResponseWriter, r *http.Request) {
	db := r.Header.Get("db")

	sqlite, err := dbutils.OpenDb(r.Context(), db)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}
	defer sqlite.Close()
	defer r.Body.Close()

	if r.Body == nil {
		utils.SendError(r.Context(), w, errors.New("invalid-input"), "invalid-input")
		return
	}

	var c connection
	err = json.NewDecoder(r.Body).Decode(&c)
	if err != nil {
		utils.SendError(r.Context(), w, err, "json-error")
		return
	}

	utils.Dbg(r.Context(), c.String())
	dbId, err := saveConnection(r.Context(), sqlite, c)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	utils.SendSuccess(r.Context(), w, struct {
		DB_ID int64 `json:"db_id"`
	}{dbId}, false)
}

func saveConnection(ctx context.Context, db *sql.DB, c connection) (int64, error) {
	sql := `insert into connections (name, user, host, port, db, is_default)
		values (?, ?, ?, ?, ?, ?) on conflict(name, user, host, port, db) do update
			set is_default = ?,
			status = 100,
			updated_at = current_timestamp`

	stmt, err := db.Prepare(sql)
	if err != nil {
		return -1, err
	}
	res, err := stmt.Exec(c.Name, c.User, c.Host, c.Port, c.Db, c.IsDefault, c.IsDefault)

	if err != nil {
		return -1, err
	}

	id, err := res.LastInsertId()

	if err != nil {
		return -1, err
	}

	if id == 0 {
		//this is a duplicate record, send the id of the record anyway
		sql := `select id from connections where name = ? and user = ? and host = ? and port = ? and db = ?`

		stmt, _ := db.Prepare(sql)
		rows, _ := stmt.Query(c.Name, c.User, c.Host, c.Port, c.Db)
		defer rows.Close()

		for rows.Next() {
			var id int64
			rows.Scan(&id)
			return id, nil
		}
	}

	return id, nil
}
