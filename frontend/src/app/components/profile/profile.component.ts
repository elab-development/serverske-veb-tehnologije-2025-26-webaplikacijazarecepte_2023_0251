import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../common/form/form.component';
import { ButtonComponent } from '../../common/button/button.component';
import { SidebarComponent, SidebarItem } from '../../common/sidebar/sidebar.component';
import { CardComponent } from '../../common/card/card.component';
import { AuthService, User } from '../../common/auth.service';
import { RecipeService } from '../../common/recipe.service';
import { Recipe } from '../../common/card/card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormComponent, ButtonComponent, SidebarComponent, CardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  showRecipeForm: boolean = false;
  isSidebarOpen: boolean = false;
  currentUser: User | null = null;
  userRecipes: Recipe[] = [];
  likedRecipes: Recipe[] = [];
  loading: boolean = false;
  likedLoading: boolean = false;
  activeTab: 'my-recipes' | 'liked-recipes' = 'my-recipes';
  
  sidebarItems: SidebarItem[] = [
    { label: 'Profil', route: '/profile' },
    { label: 'Pretraži', route: '/browse' },
    { label: 'Dodaj recept', route: '/profile' },
    { label: 'Odjavi se', route: '/login' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserRecipes();
      this.loadLikedRecipes();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadUserRecipes(): void {
    if (!this.currentUser) return;
    
    this.loading = true;
    this.recipeService.getRecipesByCreator(this.currentUser.username).subscribe({
      next: (recipes) => {
        this.userRecipes = recipes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user recipes:', error);
        this.loading = false;
      }
    });
  }

  loadLikedRecipes(): void {
    if (!this.currentUser) return;
    
    this.likedLoading = true;
    this.recipeService.getAllRecipes().subscribe({
      next: (allRecipes) => {
        this.likedRecipes = allRecipes.filter(recipe => 
          this.currentUser?.liked && this.currentUser.liked.includes(recipe.id)
        );
        this.likedLoading = false;
      },
      error: (error) => {
        console.error('Error loading liked recipes:', error);
        this.likedLoading = false;
      }
    });
  }

  toggleRecipeForm(): void {
    this.showRecipeForm = !this.showRecipeForm;
  }

  setActiveTab(tab: 'my-recipes' | 'liked-recipes'): void {
    this.activeTab = tab;
    
    // Refresh data when switching to liked recipes to ensure it's up to date
    if (tab === 'liked-recipes') {
      this.refreshUserData();
      this.loadLikedRecipes();
    }
  }

  refreshUserData(): void {
    // Refresh the current user data from localStorage in case it was updated
    this.currentUser = this.authService.getCurrentUser();
  }

  @HostListener('window:focus', ['$event'])
  onWindowFocus(event: any): void {
    // Refresh data when window gains focus (user returns from another tab/window)
    if (this.activeTab === 'liked-recipes') {
      this.refreshUserData();
      this.loadLikedRecipes();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onRecipeSubmit(recipeData: any): void {
    console.log('Recipe submitted:', recipeData);
    
    if (!this.currentUser) {
      alert('Morate biti ulogovani da biste dodali recept!');
      return;
    }

    this.recipeService.addRecipe(recipeData, this.currentUser.username).subscribe({
      next: (newRecipe) => {
        console.log('Recipe added successfully:', newRecipe);
        alert('Recept je uspešno sačuvan!');
        this.showRecipeForm = false;
        this.loadUserRecipes();
      },
      error: (error) => {
        console.error('Error adding recipe:', error);
        alert('Greška pri čuvanju recepta. Pokušajte ponovo.');
      }
    });
  }

  onSelectionChange(event: any, selectNumber: number): void {
    const value = event.target.value;
    console.log(`Select ${selectNumber} changed to:`, value);
  }

  onFilterChange(filterData: {value: string, filterNumber: number}): void {
    console.log(`Filter ${filterData.filterNumber} changed to:`, filterData.value);
  }

  onSidebarItemClick(item: SidebarItem): void {
    if (item.label === 'Dodaj recept') {
      this.toggleRecipeForm();
    } else if (item.label === 'Odjavi se') {
      this.logout();
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSidebarToggle(isOpen: boolean): void {
    console.log('Sidebar toggled:', isOpen);
    this.isSidebarOpen = isOpen;
  }
}