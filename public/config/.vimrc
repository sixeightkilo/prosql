set nocompatible
filetype off
set rtp+=~/.vim/bundle/vundle/
set runtimepath^=~/.vim/bundle/ctrlp.vim
call vundle#rc()
" This is the Vundle package, which can be found on GitHub.
" For GitHub repos, you specify plugins using the
" 'user/repository' format
Plugin 'gmarik/vundle'

" We could also add repositories with a ".git" extension
Plugin 'scrooloose/nerdtree.git'

" To get plugins from Vim Scripts, you can reference the plugin
" by name as it appears on the site
Plugin 'Buffergator'
Plugin 'beautify-web/js-beautify'
Plugin 'maksimr/vim-jsbeautify'
Plugin 'digitaltoad/vim-pug'
Plugin 'posva/vim-vue'
Plugin 'leafgarland/typescript-vim'

" Now we can turn our filetype functionality back on
filetype plugin indent on
syntax on
set hlsearch
set nu
set autoindent
set cindent
set ignorecase
colorscheme elflord
set textwidth=80
set colorcolumn=+1
autocmd FileType javascript setlocal textwidth=120 expandtab sw=4 colorcolumn=+1 ts=4 sts=4
autocmd FileType php setlocal textwidth=120 expandtab sw=4 colorcolumn=+1 ts=4 sts=4
autocmd FileType html setlocal textwidth=120 expandtab sw=4 colorcolumn=+1 ts=4 sts=4
autocmd FileType pug setlocal textwidth=120 expandtab sw=4 colorcolumn=+1 ts=4 sts=4
autocmd FileType vue setlocal textwidth=120 expandtab sw=4 colorcolumn=+1 ts=4 sts=4
autocmd FileType jl setlocal textwidth=120 expandtab sw=4 colorcolumn=+1 ts=4 sts=4
autocmd FileType go setlocal textwidth=120 sw=4 colorcolumn=+1 ts=4 sts=4
let $BASH_ENV = "~/.bash_aliases"
set noswapfile
