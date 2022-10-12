package queries

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/kargirwar/prosql-agent/utils"
	"github.com/kargirwar/prosql-sqlite/dbutils"
	_ "github.com/mattn/go-sqlite3"
)

type query struct {
	Id        int      `json:"id"`
	Query     string   `json:"query"`
	Tags      []string `json:"tags"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
}

func (q query) String() string {
	return fmt.Sprintf("i: %d q: %s t: %v c: %s u: %s", q.Id, q.Query, q.Tags, q.CreatedAt, q.UpdatedAt)
}

func QueryHandler(w http.ResponseWriter, r *http.Request) {
	utils.Dbg(r.Context(), "QueryHandler")

	if r.Method == http.MethodPost {
		handlePost(w, r)
		return
	}

	handleGet(w, r)
}

func handleGet(w http.ResponseWriter, r *http.Request) {
	db := r.Header.Get("db")
	after := r.Header.Get("after")

	limit, _ := strconv.Atoi(r.Header.Get("limit"))
	offset, _ := strconv.Atoi(r.Header.Get("offset"))

	sqlite, err := dbutils.OpenDb(r.Context(), db)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}
	defer sqlite.Close()

	queries, err := getQueries(r.Context(), sqlite, after, limit, offset)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	utils.SendSuccess(r.Context(), w, struct {
		Queries *[]query `json:"queries"`
	}{queries}, false)
}

func getQueries(ctx context.Context, db *sql.DB, after string, limit int, offset int) (*[]query, error) {
	var queries []query
	idTags := make(map[int][]string)
	utils.Dbg(ctx, fmt.Sprintf("after: %s limit %d offset %d", after, limit, offset))

	rows, err := db.Query(`select q.id, q.query, t.tag,
		q.created_at as created_at, q.updated_at as updated_at from queries as q 
		left join tags as t on q.id = t.query_id
		inner join statuses s on q.status = s.id 
		where q.updated_at > datetime(?) order by updated_at limit ? offset ?`, after, limit, offset)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	//scan rows into queries and tags into map so that they can be combined easily later
	for rows.Next() {
		var q query
		var t string
		err := rows.Scan(&q.Id, &q.Query, &t, &q.CreatedAt, &q.UpdatedAt)
		if err != nil {
			return nil, err
		}
		utils.Dbg(ctx, q.String())

		if idTags[q.Id] == nil {
			idTags[q.Id] = make([]string, 1)
			idTags[q.Id][0] = t

			//this is a new query, add it
			queries = append(queries, q)
			continue
		}

		//this is not a new query, just add its tags
		idTags[q.Id] = append(idTags[q.Id], t)
	}

	//create nice structure for the clients
	for i := 0; i < len(queries); i++ {
		queries[i].Tags = idTags[queries[i].Id]
	}

	return &queries, nil
}

func formatTs(t string) string {
	t = strings.ReplaceAll(t, "T", " ")
	t = strings.ReplaceAll(t, "Z", "")
	return t
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

	var q query
	err = json.NewDecoder(r.Body).Decode(&q)
	if err != nil {
		utils.SendError(r.Context(), w, err, "json-error")
		return
	}

	utils.Dbg(r.Context(), q.String())
	dbId, err := saveQuery(r.Context(), sqlite, q)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	utils.SendSuccess(r.Context(), w, struct {
		DB_ID int64 `json:"db_id"`
	}{dbId}, false)
}

func saveQuery(ctx context.Context, db *sql.DB, q query) (int64, error) {
	//start transaction
	tx, err := db.Begin()
	if err != nil {
		return -1, err
	}

	id, err := insertQuery(ctx, tx, q.Query)
	if err != nil {
		tx.Rollback()
		return -1, err
	}

	if id == 0 {
		//this is a duplicate record, send the id of the record anyway
		sql := `select id from queries where query = ?`

		stmt, _ := tx.Prepare(sql)
		rows, _ := stmt.Query(q.Query)
		defer rows.Close()
		defer stmt.Close()

		for rows.Next() {
			rows.Scan(&id)
		}
	}

	err = insertTags(ctx, tx, id, q.Tags)
	if err != nil {
		tx.Rollback()
		return -1, err
	}

	tx.Commit()

	return id, nil
}

func insertQuery(ctx context.Context, tx *sql.Tx, q string) (int64, error) {
	sql := `insert into queries (query)
		values (?) on conflict (query) do update
		set status = 100,
		updated_at = current_timestamp`

	stmt, err := tx.Prepare(sql)
	if err != nil {
		return -1, err
	}

	res, err := stmt.Exec(q)

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

func insertTags(ctx context.Context, tx *sql.Tx, id int64, tags []string) error {
	sql := `insert into tags (query_id, tag)
		values (?, ?) on conflict (query_id, tag) do update
		set updated_at = current_timestamp`

	stmt, err := tx.Prepare(sql)
	if err != nil {
		return err
	}

	defer stmt.Close()

	for _, t := range tags {
		_, err := stmt.Exec(id, t)

		if err != nil {
			return err
		}
	}

	return nil
}
