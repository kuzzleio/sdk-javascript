<template>
  <div></div>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.$router.replace(this.to)
  }
};
</script>
