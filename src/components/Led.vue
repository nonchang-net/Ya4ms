<template>
	<div class="Led">
		<div class="inner">
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Led extends Vue {
  @Prop() private state!: boolean;
}

</script>

<style lang="scss" scoped>

$baseBorder : 2px;
$baseWidth: 30px - $baseBorder * 2;
$innerMargin: 3px;
$innerWidth: ($baseWidth - $innerMargin * 2 - $baseBorder * 2);

$shadowOffset : 3px;
$shadowRadius : 2px;

div.Led{
	// display: block;
	border : $baseBorder solid black;
	width : $baseWidth;
	height : $baseWidth;
	border-radius: ($baseWidth/2);
	box-shadow: $shadowOffset $shadowOffset $shadowRadius rgba(0,0,0,0.4);
	background : gray;
}

div.Led div.inner{
	margin : $innerMargin ;
	width : ($innerWidth);
	height : ($innerWidth);
	border-radius: ($innerWidth / 2);
	background: rgba(255, 33, 33, 0.9);
}


</style>
