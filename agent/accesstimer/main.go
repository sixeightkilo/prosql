
package accesstimer

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/kargirwar/prosql-agent/utils"
)

type timer struct {
	id         string
	accessTime time.Time
	cancel     context.CancelFunc
}

type timers struct {
	store map[string]*timer
	mutex sync.Mutex
}

func (pt *timers) start(id string) {
	pt.mutex.Lock()
	defer pt.mutex.Unlock()

	ctx, cancel := context.WithCancel(context.Background())
	t := timer{
		id:         id,
		accessTime: time.Now(),
		cancel:     cancel,
	}
	pt.store[id] = &t

	go start(ctx, &t)
}

func (pt *timers) cancel(id string) {
	pt.mutex.Lock()
	defer pt.mutex.Unlock()

	t, present := pt.store[id]
	if !present {
		utils.Dbg(context.Background(), fmt.Sprintf("Timer %s not found", id))
		return
	}

	t.cancel()
	delete(pt.store, id)
}

func (pt *timers) getAccessTime(id string) time.Time {
	pt.mutex.Lock()
	defer pt.mutex.Unlock()

	t, present := pt.store[id]
	if !present {
		utils.Dbg(context.Background(), fmt.Sprintf("Timer %s not found", id))
		return time.Time{}
	}

	return t.accessTime
}

var timerStore *timers

const UPDATE_TIME = 10 //seconds

func init() {
	store := make(map[string]*timer)
	timerStore = &timers{
		store: store,
	}
}

func Start(id string) {
	timerStore.start(id)
}

func Cancel(id string) {
	timerStore.cancel(id)
}

func GetAccessTime(id string) time.Time {
	return timerStore.getAccessTime(id)
}

func start(ctx context.Context, t *timer) {
	ticker := time.NewTicker(UPDATE_TIME * time.Second)
	defer ticker.Stop()
	utils.Dbg(ctx, fmt.Sprintf("Starting accesstimer for %s", t.id))
loop:
	for {
		select {
		case <-ctx.Done():
			utils.Dbg(ctx, fmt.Sprintf("Stopping accesstimer for %s", t.id))
			break loop

		case <-ticker.C:
			utils.Dbg(ctx, fmt.Sprintf("Setting accesstime for %s", t.id))
			t.accessTime = time.Now()
		}
	}
}
