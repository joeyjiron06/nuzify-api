FROM launcher.gcr.io/google/nodejs

# Install node.js
RUN install_node v6.11.0

# Copy application code.
COPY . /app/

# install npm
RUN npm --unsafe-perm install -g npm@5.1.0

# install dependencies
RUN npm --unsafe-perm install