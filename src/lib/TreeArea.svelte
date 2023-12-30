<!-- TreeArea.svelte -->
<script>
    export  let area;
    export let maxTrees = 2;
  </script>
  <div class="date__single__item" style="background-image: url(img/date/date-sm-bg.png)">
    {#each area.trees as tree, i (tree)}
      {#if i == 0}
        <div class="tree1">
          <img src="img/date/d1.png" alt="">
        </div>
        <div class="date__fx">
            <div class="date__lf">
              <div class="date__single__bt date__bt1" style="background-image: url(img/d3.png)">
                <p>{tree.date}</p>
              </div>
              <div class="date__single__bt date__bt2" style="background-image: url(img/d2.png)">
                <p>{tree.dpm}</p>
              </div>
            </div>
          </div>
      {:else}
        <div class="tree2">
          <img src="img/date/d2.png" alt="">
        </div>
        <div class="tree2 date__r-sec">
            <div class="date__single__bt date__bt1" style="background-image:  url(img/d3.png)">
                <p>{tree.date}</p>
            </div>
            <div class="date__single__bt date__bt2" style="background-image: url(img/d2.png)">
                <p>{tree.dpm}</p>
            </div>
        </div>
      {/if}
      
    {/each}
  </div>
  