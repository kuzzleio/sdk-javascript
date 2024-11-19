function parseSize(size) {
  const units = {
    b: 1, // Bytes
    kb: 1024, // Kilobytes
    mb: 1024 * 1024, // Megabytes
    // eslint-disable-next-line sort-keys
    gb: 1024 * 1024 * 1024, // Gigabytes
  };

  if (typeof size !== "string") {
    throw new Error(
      `Invalid size input: expected a string, got ${typeof size}`
    );
  }

  // Extract numeric value and unit
  const match = /^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/i.exec(size.trim());
  if (!match) {
    throw new Error(
      `Invalid size format: "${size}". Expected formats like "2MB", "500KB", "3GB", etc.`
    );
  }

  const value = parseFloat(match[1]); // Get the numeric part
  const unit = (match[2] || "b").toLowerCase(); // Default to bytes if no unit is provided

  if (!units[unit]) {
    throw new Error(
      `Unknown size unit: "${unit}". Allowed units are B, KB, MB, GB.`
    );
  }

  // Convert to bytes
  return value * units[unit];
}

module.exports = {
  parseSize,
};
