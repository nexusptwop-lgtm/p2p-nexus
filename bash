# Создаем основную папку проекта
mkdir nexus-ipfs-webinterface
cd nexus-ipfs-webinterface

# Создаем полную структуру папок
mkdir -p css js/components js/utils assets/images assets/icons

# Создаем все необходимые файлы
touch index.html package.json vite.config.js
touch css/style.css css/components.css css/responsive.css
touch js/app.js js/ipfs-browser.js js/ipfs-http.js
touch js/components/file-manager.js js/components/network-monitor.js
touch js/utils/helpers.js js/utils/constants.js
touch README.md .gitignore
